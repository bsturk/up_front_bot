function initializeSetup() {
    console.log("Executing initializeSetup...");

    const stanceSelect = document.getElementById('stanceSelect');
    const generateButton = document.getElementById('generateButton');
    const resultsDisplay = document.getElementById('resultsDisplay');
    const errorDisplay = document.getElementById('errorDisplay');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const scenarioSelect = document.getElementById('scenarioSelectSetup');
    const nationalitySelect = document.getElementById('nationalitySelectSetup');

    function clear_screen() {
        console.clear();
        console.log("--- Screen Cleared ---");
    }

    function log(message) {
        console.log(message);
    }

    function randint(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function findUnitByNum(nationalityData, unitNum) {
        if (!nationalityData || !nationalityData.units) {
            if (!nationalityData) {
                 log(`Error in findUnitByNum: nationalityData is null/undefined when searching for unit num ${unitNum}`);
            } else {
                 log(`Error in findUnitByNum: nationalityData (${nationalityData.name || 'Unnamed'}) is missing 'units' array when searching for unit num ${unitNum}`);
            }
            return null;
        }
        const unitTemplate = nationalityData.units.find(u => u.num === unitNum);
        if (unitTemplate) {
            const copy = JSON.parse(JSON.stringify(unitTemplate));
            copy.pinned = copy.pinned ?? false;
            copy.eliminated = copy.eliminated ?? false;
            copy.routed = copy.routed ?? false;
            copy.malfunctioned = copy.malfunctioned ?? false;
            return copy;
        }
        log(`Info: Unit with num ${unitNum} not found in ${nationalityData.name} data.`);
        return null;
    }

    function get_cards_for_scenario(g_scenario, g_bot_player, bot_stance) {
        if (!g_scenario || typeof g_scenario !== 'object') {
            log(`Error in get_cards_for_scenario: Invalid or missing scenario data object provided.`);
            return [];
        }
         if (!g_bot_player || typeof g_bot_player !== 'object' || !g_bot_player.name) {
             log(`Error in get_cards_for_scenario: Invalid or missing player data object (or missing name property) provided. Stance: ${bot_stance}, Scenario: ${g_scenario.name || 'Unknown'}`);
             return [];
         }

        const nationNameLower = g_bot_player.name.toLowerCase();
        const key = `${nationNameLower}_cards_${bot_stance}`;

        if (!g_scenario[key] || !Array.isArray(g_scenario[key])) {
            if (g_scenario[key] === null) {
                log(`Info: No cards defined for key '${key}' in scenario '${g_scenario.name}' (null value).`);
                return [];
            }
            log(`Warning: Scenario '${g_scenario.name}' missing or has invalid data for key '${key}'. Expected an array or null.`);
            return [];
        }

        const unitNumbers = g_scenario[key];
        const cards = [];
        log(`Attempting to find units for scenario '${g_scenario.name}', player '${g_bot_player.name}', stance '${bot_stance}'. Key: '${key}'. Unit numbers: [${unitNumbers.join(', ')}]`);

        for (const unitNum of unitNumbers) {
            const unitData = findUnitByNum(g_bot_player, unitNum);
            if (unitData) {
                unitData.instanceId = `${unitData.name}_${unitData.num}_${Math.random().toString(16).slice(2)}`; // Assign unique ID per instance
                cards.push(unitData);
                log(` -> Found unit num ${unitNum}: ${unitData.name}`);
            } else {
                 log(` -> Unit num ${unitNum} not found or invalid in ${g_bot_player.name} data.`);
            }
        }
        log(`Loaded ${cards.length} cards for ${g_bot_player.name} (${bot_stance}) in scenario ${g_scenario.name}`);
        return cards;
    }

    function gen_groups( args ) {
        clear_screen();
        errorDisplay.textContent = '';

        const g_scenario = loadedScenarioData[args.scenarioName];
        const g_bot_player = loadedNationalityData[args.nationalityName];

        if (!g_scenario) {
            errorDisplay.textContent = `Critical Error: Scenario data for "${args.scenarioName}" could not be retrieved. Check global data population.`;
            log(`Error in gen_groups: loadedScenarioData['${args.scenarioName}'] is undefined.`);
            return null;
        }
        if (!g_bot_player) {
            errorDisplay.textContent = `Critical Error: Unit data for "${args.nationalityName}" could not be retrieved. Check global data population.`;
            log(`Error in gen_groups: loadedNationalityData['${args.nationalityName}'] is undefined.`);
            return null;
        }
        if (!g_bot_player.name) {
             log(`Warning: Unit data for ${args.nationalityName} is missing the 'name' property. Attempting recovery.`);
             g_bot_player.name = args.nationalityName;
        }
         if (!g_bot_player.units || !Array.isArray(g_bot_player.units)) {
              errorDisplay.textContent = `Critical Error: Unit data for "${g_bot_player.name}" is missing the 'units' array.`;
              log(`Error in gen_groups: Unit data for '${g_bot_player.name}' has no 'units' array.`);
              return null;
         }

         const bot_groups = {
             'A': { personality_cards: [] }, 'B': { personality_cards: [] },
             'C': { personality_cards: [] }, 'D': { personality_cards: [] }
         };
         let num_groups = 3; let val = randint(0, 10);
         if (g_bot_player.name === 'Germany' || g_bot_player.name === 'British') { val -= 1; }
         else if (g_bot_player.name === 'Russia' || g_bot_player.name === 'Italian') { val += 1; }
         if (val <= 3) { num_groups = 2; } else if (val >= 8) { num_groups = 4; }
         log(`Initial random value: ${val}, Determined number of groups: ${num_groups}`);

         log("Skipping Pillbox logic (TODO).");
         const requiresPillbox = false; let pillboxGroupIndex = 1;

         const cards = get_cards_for_scenario(g_scenario, g_bot_player, args.bot_stance);

         if (!cards || cards.length === 0) {
              errorDisplay.textContent = `Error: No units found for ${g_bot_player.name} (${args.bot_stance}) in scenario ${g_scenario.name}. Check scenario file's card list (key: ${g_bot_player.name.toLowerCase()}_cards_${args.bot_stance}) or unit data file.`;
              log(`Warning in gen_groups: No units loaded for ${g_bot_player.name} (${args.bot_stance}) in scenario ${g_scenario.name}. Cannot generate groups.`);
               return { 'A': { personality_cards: [] }, 'B': { personality_cards: [] }, 'C': { personality_cards: [] }, 'D': { personality_cards: [] } };
         }
         log(`Total cards retrieved for distribution: ${cards.length}`);

         let afvs_igs = []; let infantry = [];
         let found_sl = false; let found_asl = false; let sl = null; let asl = null;

         for (const card of cards) {
             const cardType = card.card_type || 'Man';
             if (card.sl === true) { sl = card; found_sl = true; log('SL card identified: ' + card.name); }
             else if (card.asl === true) { asl = card; found_asl = true; log('ASL card identified: ' + card.name); }
             else if (cardType === 'AFV' || cardType === 'IG') { afvs_igs.push(card); log(`AFV/IG identified: ${card.name}`); }
             else { infantry.push(card); }
         }
         log(`Separated cards: ${afvs_igs.length} AFV/IGs, ${infantry.length} Infantry, SL found: ${found_sl}, ASL found: ${found_asl}`);

         let min_num_groups = afvs_igs.length + (found_sl ? 1 : 0) + (found_asl ? 1 : 0);
         if (requiresPillbox) { min_num_groups += 1; }

         if (min_num_groups > num_groups) {
              log(`Minimum groups needed (${min_num_groups}) exceeds initial roll (${num_groups}). Increasing num_groups.`);
              num_groups = min_num_groups;
         }
         if (num_groups > 4) {
             log(`Calculated groups (${num_groups}) exceeds maximum (4). Setting num_groups to 4.`);
             num_groups = 4;
             if (min_num_groups > 4) {
                 errorDisplay.textContent = `Warning: More than 4 groups (${min_num_groups}) are minimally required (Leaders, AFVs, Pillbox). Distribution might be forced/invalid.`;
                 log(`Error condition: Minimum required groups (${min_num_groups}) is > 4.`);
             }
         }
         if (num_groups <= 0 && cards.length > 0) {
              log(`Warning: Calculated num_groups is ${num_groups}, but cards exist. Setting num_groups to 1.`);
              num_groups = 1;
         }
         if (cards.length === 0) {
              num_groups = 0;
         }
         log(`Final number of groups to generate: ${num_groups}`);

         let groups_cards = num_groups > 0 ? Array.from({ length: num_groups }, () => []) : [];
         const groupLetters = ['A', 'B', 'C', 'D'];
         let available_group_indices = num_groups > 0 ? Array.from({ length: num_groups }, (_, i) => i) : [];

         if (requiresPillbox) {
             if (pillboxGroupIndex >= 0 && pillboxGroupIndex < available_group_indices.length) {
                 const actualIndexToRemove = available_group_indices.indexOf(pillboxGroupIndex);
                 if (actualIndexToRemove > -1) {
                    available_group_indices.splice(actualIndexToRemove, 1);
                    log(`Reserved Group ${groupLetters[pillboxGroupIndex]} (index ${pillboxGroupIndex}) for Pillbox.`);
                 } else {
                      log(`Warning: Pillbox group index ${pillboxGroupIndex} was not found in the available indices list.`);
                 }
             } else {
                 log(`Warning: Pillbox group index ${pillboxGroupIndex} is out of bounds for ${num_groups} groups. Pillbox not assigned uniquely.`);
             }
         }

         const afv_igs_groups = [];
         for (const single of afvs_igs) {
             if (available_group_indices.length === 0) {
                 errorDisplay.textContent = `Error: Not enough available groups (${available_group_indices.length} left) for AFV/IG ${single.name}. Min required: ${min_num_groups}, Groups generated: ${num_groups}.`;
                 log(`Error placing AFV/IG ${single.name}. No empty group slots remain in available_group_indices: [${available_group_indices}]`);
                 break;
             }
             let placed = false;
             let emptyGroupIdxInAvailable = -1;
             for(let i = 0; i < available_group_indices.length; i++){
                 const groupVal = available_group_indices[i];
                 if(groups_cards[groupVal] && groups_cards[groupVal].length === 0){
                     emptyGroupIdxInAvailable = i;
                     break;
                 }
             }

             if(emptyGroupIdxInAvailable !== -1){
                 const groupVal = available_group_indices[emptyGroupIdxInAvailable];
                 groups_cards[groupVal].push(single);
                 afv_igs_groups.push(groupVal);
                 available_group_indices.splice(emptyGroupIdxInAvailable, 1);
                 log(`Placed AFV/IG ${single.name} into empty Group ${groupLetters[groupVal]}`);
                 placed = true;
             } else {
                 log(`No empty groups left for AFV/IG ${single.name}. Placing randomly into an available group.`);
                 const randIndexIntoAvailable = randint(0, available_group_indices.length - 1);
                 const groupVal = available_group_indices[randIndexIntoAvailable];
                 groups_cards[groupVal].push(single);
                 afv_igs_groups.push(groupVal);
                 available_group_indices.splice(randIndexIntoAvailable, 1);
                 log(`Placed AFV/IG ${single.name} into Group ${groupLetters[groupVal]} (may share)`);
                 placed = true;
             }
             if (!placed) {
                errorDisplay.textContent = `Internal Error: Failed to place AFV/IG ${single.name}.`;
                log(`Placement failed unexpectedly for AFV/IG ${single.name}`);
                return null;
             }
         }

         let did_sl = false; let did_asl = false; let sl_group = -1; let asl_group = -1;

         if (found_sl && sl) {
             if (available_group_indices.length === 0) {
                 errorDisplay.textContent = `Error: No group left for SL ${sl.name}. Required ${min_num_groups}, generated ${num_groups}. Distribution might be invalid.`;
                 log(`Error placing SL ${sl.name}. No groups left in available_group_indices.`);
             } else {
                 let placed = false;
                 let emptyGroupIdxInAvailable = -1;
                 for(let i = 0; i < available_group_indices.length; i++){
                     const groupVal = available_group_indices[i];
                     if(groups_cards[groupVal] && groups_cards[groupVal].length === 0){
                         emptyGroupIdxInAvailable = i;
                         break;
                     }
                 }

                 if(emptyGroupIdxInAvailable !== -1){
                     const groupVal = available_group_indices[emptyGroupIdxInAvailable];
                     groups_cards[groupVal].push(sl);
                     sl_group = groupVal;
                     did_sl = true;
                     available_group_indices.splice(emptyGroupIdxInAvailable, 1);
                     log(`Placed SL ${sl.name} into empty Group ${groupLetters[groupVal]}`);
                     placed = true;
                 } else if (available_group_indices.length > 0) {
                      log(`No empty groups left for SL ${sl.name}. Placing randomly.`);
                      const randIndexIntoAvailable = randint(0, available_group_indices.length - 1);
                      const groupVal = available_group_indices[randIndexIntoAvailable];
                      groups_cards[groupVal].push(sl);
                      sl_group = groupVal;
                      did_sl = true;
                      available_group_indices.splice(randIndexIntoAvailable, 1);
                      log(`Placed SL ${sl.name} into Group ${groupLetters[groupVal]} (may share)`);
                      placed = true;
                 }
                 if (!placed) {
                      errorDisplay.textContent = `Error: Could not find suitable group for SL ${sl.name}.`;
                      log(`Placement failed for SL ${sl.name}. Available indices: [${available_group_indices.join(', ')}]`);
                 }
            }
         }

         if (found_asl && asl) {
              if (available_group_indices.length === 0) {
                  errorDisplay.textContent = `Error: No group left for ASL ${asl.name}. Required ${min_num_groups}, generated ${num_groups}. Distribution might be invalid.`;
                  log(`Error placing ASL ${asl.name}. No groups left in available_group_indices.`);
              } else {
                  let placed = false;
                  let emptyGroupIdxInAvailable = -1;
                  for(let i = 0; i < available_group_indices.length; i++){
                      const groupVal = available_group_indices[i];
                      if(groups_cards[groupVal] && groups_cards[groupVal].length === 0){
                          emptyGroupIdxInAvailable = i;
                          break;
                      }
                  }

                  if(emptyGroupIdxInAvailable !== -1){
                      const groupVal = available_group_indices[emptyGroupIdxInAvailable];
                      groups_cards[groupVal].push(asl);
                      asl_group = groupVal;
                      did_asl = true;
                      available_group_indices.splice(emptyGroupIdxInAvailable, 1);
                      log(`Placed ASL ${asl.name} into empty Group ${groupLetters[groupVal]}`);
                      placed = true;
                  } else if (available_group_indices.length > 0) {
                      log(`No empty groups left for ASL ${asl.name}. Placing randomly.`);
                      const randIndexIntoAvailable = randint(0, available_group_indices.length - 1);
                      const groupVal = available_group_indices[randIndexIntoAvailable];
                      groups_cards[groupVal].push(asl);
                      asl_group = groupVal;
                      did_asl = true;
                      available_group_indices.splice(randIndexIntoAvailable, 1);
                      log(`Placed ASL ${asl.name} into Group ${groupLetters[groupVal]} (may share)`);
                      placed = true;
                  }
                  if (!placed) {
                      errorDisplay.textContent = `Error: Could not find suitable group for ASL ${asl.name}.`;
                      log(`Placement failed for ASL ${asl.name}. Available indices: [${available_group_indices.join(', ')}]`);
                  }
              }
         }
         log(`Available group indices after Leader placement: [${available_group_indices.map(i => groupLetters[i]).join(', ')}]`);

         infantry.sort((a, b) => (b.morale ?? -Infinity) - (a.morale ?? -Infinity));

         const num_inf = infantry.length;
         const avail_infantry_groups_indices = [];
         if (sl_group !== -1 && groups_cards[sl_group]) avail_infantry_groups_indices.push(sl_group);
         if (asl_group !== -1 && asl_group !== sl_group && groups_cards[asl_group]) avail_infantry_groups_indices.push(asl_group);
         available_group_indices.forEach(index => {
              if (groups_cards[index] && !avail_infantry_groups_indices.includes(index)) {
                  avail_infantry_groups_indices.push(index);
              }
         });
         afv_igs_groups.forEach(index => {
             if (groups_cards[index] && !avail_infantry_groups_indices.includes(index)) {
                  avail_infantry_groups_indices.push(index);
             }
         });
         if (requiresPillbox && pillboxGroupIndex !== -1 && groups_cards[pillboxGroupIndex] && !avail_infantry_groups_indices.includes(pillboxGroupIndex)) {
              avail_infantry_groups_indices.push(pillboxGroupIndex);
         }

         const final_avail_infantry_groups = avail_infantry_groups_indices.filter(index => index >= 0 && index < num_groups);
         log(`Groups available for infantry distribution: [${final_avail_infantry_groups.map(i => groupLetters[i]).join(', ')}]`);

         if (final_avail_infantry_groups.length === 0 && num_inf > 0) {
               if (num_groups > 0) {
                    log(`Warning: No suitable groups identified for infantry distribution, but ${num_groups} group(s) exist. Adding infantry to the first group (Group A).`);
                    const targetGroupIndex = 0;
                    infantry.forEach(inf => {
                        if (groups_cards[targetGroupIndex]) {
                           groups_cards[targetGroupIndex].push(inf);
                        } else {
                           errorDisplay.textContent = `Internal Error: Target group ${groupLetters[targetGroupIndex]} does not exist for forced infantry placement.`;
                           log(`Error: Could not place infantry ${inf.name} into non-existent group ${targetGroupIndex}`);
                        }
                    });
                    infantry = [];
               } else {
                    errorDisplay.textContent = "Error: No groups generated to distribute infantry!";
                    log("Error: Cannot distribute infantry as no groups were finalized.");
               }
         }

         let cur_group_counter = 0;
         while(infantry.length > 0) {
             if (final_avail_infantry_groups.length === 0) {
                  errorDisplay.textContent = `Internal Error: Ran out of groups while distributing infantry. ${infantry.length} remaining.`;
                  log(`Error: No groups left in final_avail_infantry_groups. ${infantry.length} infantry unassigned.`);
                  break;
             }
             const inf = infantry.shift();
             const cur_group_index = final_avail_infantry_groups[cur_group_counter];

             if (groups_cards[cur_group_index]) {
                 groups_cards[cur_group_index].push(inf);
             } else {
                  errorDisplay.textContent = `Internal Error: Invalid target group index ${cur_group_index} for infantry distribution.`;
                  log(`Error: Attempted to add infantry ${inf.name} to non-existent group index ${cur_group_index}. Available: [${final_avail_infantry_groups.join(', ')}]`);
             }
             cur_group_counter = (cur_group_counter + 1) % final_avail_infantry_groups.length; // Wrap around
         }
         log(`Infantry distribution complete.`);

         const finalGroups = {};
         for(let i = 0; i < num_groups; i++) {
             const letter = groupLetters[i];
             if (groups_cards[i] && Array.isArray(groups_cards[i])) {

                  finalGroups[letter] = { personality_cards: groups_cards[i] };
                  finalGroups[letter].personality_cards.sort((a, b) => {
                       if (a.sl) return -1; if (b.sl) return 1;
                       if (a.asl) return -1; if (b.asl) return 1;
                       return 0;
                   });
             }
         }

        log("Group generation complete. Final groups object created.");
        return finalGroups;
    }

    function display_groups(generatedGroups) {
        resultsDisplay.innerHTML = '';

        if (!generatedGroups) {
            resultsDisplay.innerHTML = '<p>Group generation failed. See error message above or console logs.</p>';
            return;
        }

        let content = '';
        let groupFound = false;
        const groupNames = Object.keys(generatedGroups).sort();

        for (const groupName of groupNames) {
            const group = generatedGroups[groupName];
            if (group && Array.isArray(group.personality_cards)) {
                 groupFound = true;
                 content += `<h4>Group ${groupName}</h4>`;
                 if (group.personality_cards.length > 0) {
                     content += `<ul>`;
                     group.personality_cards.forEach(card => {
                         let cardDesc = `${card.name || 'Unnamed Unit'}`;
                         cardDesc += ` (${card.card_type || 'Unknown Type'}`;
                         if (card.sl) cardDesc += ', SL';
                         if (card.asl) cardDesc += ', ASL';
                         if (card.morale !== undefined && card.morale !== null && card.morale !== -1) cardDesc += `, Morale: ${card.morale}`;
                          if (card.weapon) cardDesc += `, Weapon: ${card.weapon}`;
                         cardDesc += `)`;
                         content += `<li><span class="unit-num">(<strong>${card.num}</strong>)</span><span class="unit-desc">${cardDesc}</span></li>`;
                     });
                     content += `</ul>`;
                 } else {
                     content += `<p><i>(Empty Group ${groupName})</i></p>`;
                     log(`Note: Group ${groupName} was generated but is empty.`);
                 }
            } else {
                 log(`Warning in display_groups: Invalid group structure encountered for key ${groupName}. Skipping.`);
            }
        }

        if (!groupFound) {
             if (Object.keys(generatedGroups).length === 0 && !errorDisplay.textContent) {
                   content = '<p>No groups were generated (check setup or scenario data).</p>';
             } else if (!errorDisplay.textContent) {
                   content = '<p>Groups generated, but failed to display (check console for errors).</p>';
             }
        }

        if (!errorDisplay.textContent) {
           resultsDisplay.innerHTML = content;
        } else if (content && resultsDisplay.innerHTML === '<p>Group generation failed. See error message above or console logs.</p>') {
            resultsDisplay.innerHTML += content;
        }

    }

    function updateStanceDropdown() {
        console.log("Executing updateStanceDropdown...");
        const selectedScenarioValue = scenarioSelect.value;
        const selectedNationalityValue = nationalitySelect.value;

        const currentSelectedStance = stanceSelect.value;

        stanceSelect.innerHTML = '';
        stanceSelect.disabled = true;
        generateButton.disabled = true;

        if (!selectedScenarioValue || !selectedNationalityValue) {
            console.log("updateStanceDropdown: No scenario or nationality selected, adding default option.");
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "-- Select Scenario & Nation --";
            stanceSelect.appendChild(defaultOption);
             if (stanceSelect) stanceSelect.dispatchEvent(new Event('change'));
            return;
        }

        const scenarioData = loadedScenarioData[selectedScenarioValue];
        if (!scenarioData) {
            console.error(`updateStanceDropdown: Scenario data not found for ${selectedScenarioValue}`);
             const errorOption = document.createElement('option');
             errorOption.value = "";
             errorOption.textContent = "-- Error: Scenario Data Missing --";
             stanceSelect.appendChild(errorOption);
             if (stanceSelect) stanceSelect.dispatchEvent(new Event('change'));
            return;
        }
        let nationalityNameLower = '';
        if (selectedNationalityValue && loadedNationalityData[selectedNationalityValue] && loadedNationalityData[selectedNationalityValue].name) {
             nationalityNameLower = loadedNationalityData[selectedNationalityValue].name.toLowerCase();
        } else if (selectedNationalityValue) {
             nationalityNameLower = selectedNationalityValue.toLowerCase();
             log(`Warning: Could not find .name property for ${selectedNationalityValue}, using key directly for stance lookup.`);
        } else {
             console.error("updateStanceDropdown: Invalid nationality data or value.");
             const errorOption = document.createElement('option');
             errorOption.value = "";
             errorOption.textContent = "-- Error: Nationality Data --";
             stanceSelect.appendChild(errorOption);
              if (stanceSelect) stanceSelect.dispatchEvent(new Event('change'));
             return;
        }

        const attackerKey = `${nationalityNameLower}_cards_attacker`;
        const defenderKey = `${nationalityNameLower}_cards_defender`;

        let attackerAvailable = false;
        let defenderAvailable = false;

        if (scenarioData[attackerKey] != null && Array.isArray(scenarioData[attackerKey]) && scenarioData[attackerKey].length > 0) {
            attackerAvailable = true;
        } else {
            log(`Info: Attacker cards not defined or empty for ${nationalityNameLower} in ${selectedScenarioValue} (key: ${attackerKey}).`);
        }

        if (scenarioData[defenderKey] != null && Array.isArray(scenarioData[defenderKey]) && scenarioData[defenderKey].length > 0) {
             defenderAvailable = true;
        } else {
             log(`Info: Defender cards not defined or empty for ${nationalityNameLower} in ${selectedScenarioValue} (key: ${defenderKey}).`);
        }

        let optionsAdded = 0;
        let firstValidValue = "";

        if (attackerAvailable) {
            const option = document.createElement('option');
            option.value = "attacker";
            option.textContent = "Attacker";
            stanceSelect.appendChild(option);
            optionsAdded++;
            if (firstValidValue === "") firstValidValue = "attacker";
            log(`Stance: Attacker available for ${selectedNationalityValue} in ${selectedScenarioValue}`);
        }

        if (defenderAvailable) {
            const option = document.createElement('option');
            option.value = "defender";
            option.textContent = "Defender";
            stanceSelect.appendChild(option);
            optionsAdded++;
            if (firstValidValue === "") firstValidValue = "defender";
             log(`Stance: Defender available for ${selectedNationalityValue} in ${selectedScenarioValue}`);
        }

        if (optionsAdded === 0) {
            console.warn("updateStanceDropdown: No valid stances found for selected scenario/nationality combination.");
            const noOption = document.createElement('option');
            noOption.value = "";
            noOption.textContent = "-- No Stances Defined --";
            stanceSelect.appendChild(noOption);
            stanceSelect.disabled = true;
            generateButton.disabled = true;
        } else {
            stanceSelect.disabled = false;
            if (currentSelectedStance && stanceSelect.querySelector(`option[value="${currentSelectedStance}"]`)) {
                stanceSelect.value = currentSelectedStance;
                console.log(`updateStanceDropdown: Restored previous stance selection: ${currentSelectedStance}`);
            } else {
                 stanceSelect.value = firstValidValue;
                 console.log(`updateStanceDropdown: Defaulting stance selection to: ${firstValidValue}`);
            }
            generateButton.disabled = !stanceSelect.value;
        }

         if (stanceSelect) {
            console.log("updateStanceDropdown: Dispatching 'change' event on stanceSelect.");
            stanceSelect.dispatchEvent(new Event('change'));
         } else {
             console.error("updateStanceDropdown: stanceSelect element not found after population attempt.");
         }
         console.log("updateStanceDropdown finished.");
    }

    function initializeSetupTab() {
        console.log("initializeSetupTab started...");
        generateButton.disabled = true;
        loadingSpinner.style.display = 'none';
        errorDisplay.textContent = '';
        resultsDisplay.innerHTML = '';
        stanceSelect.disabled = true;

        try {
            // --- Scenario Population ---
            if (scenarioSelect) {
                 console.log("Attempting to populate Scenario dropdown.");
                 scenarioSelect.innerHTML = '<option value="">-- Select Scenario --</option>';
                 if (typeof loadedScenarioData !== 'undefined') {
                      console.log("loadedScenarioData object:", JSON.parse(JSON.stringify(loadedScenarioData)));
                      let scenarioCount = 0;
                      for (const key in loadedScenarioData) {
                           console.log(`Processing scenario key: "${key}"`);
                           if (Object.prototype.hasOwnProperty.call(loadedScenarioData, key)) {
                                const scenario = loadedScenarioData[key];
                                console.log(`  - Scenario object for key "${key}":`, scenario);
                                if (scenario && scenario.name && typeof scenario.name === 'string' && scenario.name.trim() !== '') {
                                     console.log(`  - Valid name found: "${scenario.name}". Adding to dropdown.`);
                                     const option = document.createElement('option');
                                     option.value = scenario.name;
                                     option.textContent = scenario.name;
                                     scenarioSelect.appendChild(option);
                                     scenarioCount++;
                                } else {
                                     log(`Warning: Invalid scenario data found under key '${key}'. Missing/invalid object or .name property.`);
                                     console.log("  - Invalid scenario object details:", scenario);
                                }
                           }
                      }
                      log(`Populated Setup Tab Scenario dropdown with ${scenarioCount} scenarios.`);
                      if (scenarioCount === 0 && Object.keys(loadedScenarioData).length > 0) {
                          console.error("Scenario data exists in loadedScenarioData, but none had a valid .name property!");
                          errorDisplay.textContent += " Error: Scenario data loaded but names are missing. ";
                      } else if (scenarioCount === 0) {
                          console.warn("No scenarios found in loadedScenarioData to populate dropdown.");
                          scenarioSelect.innerHTML = '<option value="">No Scenarios Loaded</option>';
                      }
                 } else {
                      console.error("Setup Tab: global loadedScenarioData is undefined.");
                      scenarioSelect.innerHTML = '<option value="">Error: Scenarios Undefined</option>';
                       throw new Error("loadedScenarioData is undefined.");
                 }
            } else {
                 console.error("Setup Tab: Scenario select element (scenarioSelectSetup) not found in DOM.");
                 throw new Error("Scenario dropdown element missing.");
            }

            if (nationalitySelect) {
                 console.log("Attempting to populate Nationality dropdown.");
                 nationalitySelect.innerHTML = '<option value="">-- Select Nationality --</option>';
                 if (typeof loadedNationalityData !== 'undefined') {
                      console.log("loadedNationalityData object:", JSON.parse(JSON.stringify(loadedNationalityData)));
                      let natCount = 0;
                      for (const key in loadedNationalityData) {
                           console.log(`Processing nationality key: "${key}"`);
                           if (Object.prototype.hasOwnProperty.call(loadedNationalityData, key)) {
                                const nation = loadedNationalityData[key];
                                console.log(`  - Nation object for key "${key}":`, nation);
                                if (nation && nation.name && typeof nation.name === 'string' && nation.name.trim() !== '') {
                                     console.log(`  - Valid name found: "${nation.name}". Adding to dropdown.`);
                                     const option = document.createElement('option');
                                     option.value = nation.name;
                                     option.textContent = nation.name;
                                     nationalitySelect.appendChild(option);
                                     natCount++;
                                } else {
                                     log(`Warning: Invalid nationality data found under key '${key}'. Missing/invalid object or .name property.`);
                                     console.log("  - Invalid nation object details:", nation);
                                }
                           }
                      }
                      log(`Populated Setup Tab Nationality dropdown with ${natCount} nationalities.`);
                      if (natCount === 0 && Object.keys(loadedNationalityData).length > 0) {
                           console.error("Nationality data exists in loadedNationalityData, but none had a valid .name property!");
                           errorDisplay.textContent += " Error: Nationality data loaded but names are missing. ";
                      } else if (natCount === 0) {
                          console.warn("No nationalities found in loadedNationalityData to populate dropdown.");
                          nationalitySelect.innerHTML = '<option value="">No Nationalities Loaded</option>';
                      }
                 } else {
                      console.error("Setup Tab: global loadedNationalityData is undefined.");
                      nationalitySelect.innerHTML = '<option value="">Error: Nationalities Undefined</option>';
                      throw new Error("loadedNationalityData is undefined.");
                 }
            } else {
                 console.error("Setup Tab: Nationality select element (nationalitySelectSetup) not found in DOM.");
                 throw new Error("Nationality dropdown element missing.");
            }

             const totalOptions = (scenarioSelect.options.length - 1) + (nationalitySelect.options.length - 1);
             if (totalOptions > 0) {
                console.log("Dropdowns populated, running updateStanceDropdown...");
                updateStanceDropdown();
             } else {
                console.warn("Neither scenario nor nationality dropdowns were populated. Stance dropdown remains disabled.");
                stanceSelect.innerHTML = '<option value="">-- Load Data First --</option>';
                stanceSelect.disabled = true;
                generateButton.disabled = true;
                 if (!errorDisplay.textContent) {
                     errorDisplay.textContent = "Failed to load valid Scenario/Nationality data.";
                 }
             }


        } catch (error) {
            errorDisplay.textContent = `Setup Tab Initialization Error: ${error.message}`;
            console.error("Setup Tab Initialization failed:", error);
            generateButton.disabled = true;
            stanceSelect.disabled = true;
             if (scenarioSelect && scenarioSelect.options.length <= 1) scenarioSelect.innerHTML = '<option value="">Load Error</option>';
             if (nationalitySelect && nationalitySelect.options.length <= 1) nationalitySelect.innerHTML = '<option value="">Load Error</option>';
        }
        console.log("initializeSetupTab finished.");
    }

    generateButton.addEventListener('click', () => {
        const selectedScenario = scenarioSelect.value;
        const selectedNationality = nationalitySelect.value;
        const selectedStance = stanceSelect.value;

        errorDisplay.textContent = '';
        resultsDisplay.innerHTML = '';
        loadingSpinner.style.display = 'block';

        if (!selectedScenario || !selectedNationality || !selectedStance) {
             errorDisplay.textContent = 'Please ensure Scenario, Nationality, and a valid Stance are selected.';
             loadingSpinner.style.display = 'none';
             return;
         }
         if (!loadedScenarioData[selectedScenario] || !loadedNationalityData[selectedNationality]) {
              errorDisplay.textContent = `Error: Data for selected scenario or nationality is missing.`;
              loadingSpinner.style.display = 'none'; return;
         }

        log(`Generating groups for: Scenario='${selectedScenario}', Nationality='${selectedNationality}', Stance='${selectedStance}'`);

        const args = {
            scenarioName: selectedScenario,
            nationalityName: selectedNationality,
            bot_stance: selectedStance
        };

        setTimeout(() => {
            try {
                const generatedGroups = gen_groups(args);
                display_groups(generatedGroups);
                if (generatedGroups && Object.keys(generatedGroups).length > 0 && !errorDisplay.textContent) {
                     log("Display complete. Group generation successful.");
                } else if (generatedGroups) {
                      log("Group generation process completed, but resulted in no groups or display failed.");
                } else {
                     log("Group generation process failed.");
                }
            } catch (err) {
                errorDisplay.textContent = `An unexpected error occurred during generation: ${err.message}`;
                console.error("Generation/Display Error:", err);
                resultsDisplay.innerHTML = '<p>An unexpected error occurred. Check the console for details.</p>';
            } finally {
                 loadingSpinner.style.display = 'none';
            }
        }, 10);
    });

    if(scenarioSelect) {
        scenarioSelect.addEventListener('change', () => {
            resultsDisplay.innerHTML = '';
            errorDisplay.textContent = '';
            updateStanceDropdown();
        });
    }

    if(nationalitySelect) {
        nationalitySelect.addEventListener('change', (event) => {
            resultsDisplay.innerHTML = '';
            errorDisplay.textContent = '';
            updateStanceDropdown();

            const newNationalityValue = event.target.value;
            const slaNationalityGameTab = document.getElementById('slaNationality');
            if (slaNationalityGameTab) {
                let valueExists = false;
                for (let i = 0; i < slaNationalityGameTab.options.length; i++) {
                    if (slaNationalityGameTab.options[i].value === newNationalityValue) {
                        valueExists = true;
                        break;
                    }
                }
                if (valueExists) {
                    slaNationalityGameTab.value = newNationalityValue;
                    log(`Propagated nationality '${newNationalityValue}' from Setup to Game Tab.`);
                    slaNationalityGameTab.dispatchEvent(new Event('change'));
                } else if (newNationalityValue === "") {
                     slaNationalityGameTab.value = "";
                     log("Cleared nationality selection on Game Tab due to Setup Tab clearing.");
                     slaNationalityGameTab.dispatchEvent(new Event('change'));
                } else {
                    log(`Warning: Nationality '${newNationalityValue}' selected in Setup not found in Game Tab dropdown. Cannot propagate.`);
                }
            } else {
                log("Error: Could not find Game Tab's Nationality Selector (id='slaNationality') to propagate selection.");
            }
        });
    }

     if(stanceSelect) {
         stanceSelect.addEventListener('change', () => {
              generateButton.disabled = !stanceSelect.value;
         });
     }

    initializeSetupTab();
}

if (window.gameDataReady) {
    console.log("setup.js: Data flag is set, initializing setup immediately.");
    initializeSetup();
} else {
    console.log("setup.js: Data flag not set, adding dataReady listener.");
    document.addEventListener('dataReady', () => {
        console.log("setup.js: dataReady event received, initializing setup.");
        initializeSetup();
    }, { once: true });
}
