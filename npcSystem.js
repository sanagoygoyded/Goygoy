/**
 * Gods of Egypt MMORPG - NPC Dialog System
 * NPC'lerle etkileşim ve diyalog sistemi
 */

(function(window) {
    'use strict';

    // NPC Definitions
    const NPC_DEFINITIONS = [
        {
            id: 'village_elder',
            name: 'Köy Yaşlısı Thoth',
            role: 'Quest Giver',
            portrait: 'player',
            description: 'Nil nehri kıyısında yıllardır yaşayan bilgeli yaşlı.',
            dialogues: [
                {
                    id: 'greeting',
                    text: 'Merhaba genç Bek! Nil nehri bolluk içinde ama Set\'in vergileri halkı eziyor. Tanrılara karşı durmaya cesaretin var mı?',
                    options: [
                        { text: 'Ne yapmamı istersin?', next: 'quest_offer' },
                        { text: 'Set\'in vergileri hakkında daha fazla anlat', next: 'set_taxes' },
                        { text: 'Tanrılara karşı durmak istiyorum!', next: 'rebel_path' },
                        { text: 'Hoşça kal', next: 'goodbye' }
                    ]
                },
                {
                    id: 'quest_offer',
                    text: 'Nil\'de buğday topla ve obelisk inşasına katkı ver. Tanrılar bize lütuf sunacak. Seni göreve alabiliriz.',
                    options: [
                        { text: 'Görevi kabul et', action: 'start_quest_tutorial_1', next: 'quest_accepted' },
                        { text: 'Daha sonra dönerim', next: 'greeting' }
                    ]
                },
                {
                    id: 'set_taxes',
                    text: 'Set, her ölümlüden aylık 50 altın vergi istiyor. Ödeyemeyenler Duat\'a, Anubis\'in huzuruna gönderiliyor. Bu zulüm!',
                    options: [
                        { text: 'Horus\'un Gözü\'nü çalmalıyız', next: 'horus_eye' },
                        { text: 'Bu korkunç...', next: 'greeting' }
                    ]
                },
                {
                    id: 'horus_eye',
                    text: 'Evet! Horustapınak\'ta tuzaklarla dolu piramidin derinliklerinde Set, Horus\'un gözlerini saklıyor. Onları geri alırsak Set zayıflar!',
                    options: [
                        { text: 'Bunu yapacağım!', action: 'unlock_quest_steal_eye', next: 'rebel_encouraged' },
                        { text: 'Çok tehlikeli...', next: 'greeting' }
                    ]
                },
                {
                    id: 'rebel_path',
                    text: 'Cesur bir ruh! Tanrıya yükselmek için Horus\'un Gözü\'nü çalman veya 50 İlahi Lütuf toplaman gerek. Köyümüze yardım et, biz de sana yardımcı olalım.',
                    options: [
                        { text: 'Yardım etmeye hazırım', action: 'start_quest_tutorial_1', next: 'quest_accepted' },
                        { text: 'Nereden başlamalıyım?', next: 'quest_offer' }
                    ]
                },
                {
                    id: 'quest_accepted',
                    text: 'Harika! E tuşuna basarak Nil\'den buğday topla. Obelisk inşasına taş ve odun bağışla. Tanrılar lütfunu sunacak!',
                    options: [
                        { text: 'Anlaşıldı!', next: 'goodbye' }
                    ]
                },
                {
                    id: 'rebel_encouraged',
                    text: 'Tanrılar seninle gurur duyacak Bek! Horustapınak\'a git ama dikkatli ol - tuzaklar ölümcül olabilir.',
                    options: [
                        { text: 'Hazırım!', next: 'goodbye' }
                    ]
                },
                {
                    id: 'goodbye',
                    text: 'Tanrılar yoluyla git, oğlum. Nil seni korusun!',
                    options: []
                }
            ],
            location: 'misir',
            position: { x: 5, y: 0, z: 8 }
        },
        {
            id: 'merchant',
            name: 'Tüccar Ahmed',
            role: 'Trader',
            portrait: 'inventory',
            description: 'Nil kıyısında ticaret yapan zengin tüccar.',
            dialogues: [
                {
                    id: 'greeting',
                    text: 'Hoş geldin yolcu! En iyi eşyalarım sergide. Altınım varsa ticaret yapabiliriz.',
                    options: [
                        { text: 'Ne satıyorsun?', next: 'shop' },
                        { text: 'Fiyatlar yüksek...', next: 'prices' },
                        { text: 'Görüşürüz', next: 'goodbye' }
                    ]
                },
                {
                    id: 'shop',
                    text: 'Silahlar, zırhlar ve nadir eşyalar! 100 altına Bronz Kılıç, 200 altına Timsah Zırhı satıyorum.',
                    options: [
                        { text: 'Bronz Kılıç al (100 Altın)', action: 'buy_bronze_sword', next: 'shop_transaction' },
                        { text: 'Timsah Zırhı al (200 Altın)', action: 'buy_croc_armor', next: 'shop_transaction' },
                        { text: 'Geri dön', next: 'greeting' }
                    ]
                },
                {
                    id: 'prices',
                    text: 'Set\'in vergileri nedeniyle fiyatlar arttı. Ama kalitemden ödün vermem!',
                    options: [
                        { text: 'Pazarlık edelim', next: 'bargain' },
                        { text: 'Anlaşıldı', next: 'greeting' }
                    ]
                },
                {
                    id: 'bargain',
                    text: 'Hmm... Seni beğendim. İlk alışverişte %10 indirim yaparım. Fırsatı kaçırma!',
                    options: [
                        { text: 'Teşekkürler!', next: 'shop' },
                        { text: 'Düşüneyim', next: 'greeting' }
                    ]
                },
                {
                    id: 'shop_transaction',
                    text: 'Harika seçim! Eşyanı çantana ekledim. Daha fazlası için geri gel!',
                    options: [
                        { text: 'Teşekkürler', next: 'goodbye' },
                        { text: 'Daha alışveriş yapacağım', next: 'shop' }
                    ]
                },
                {
                    id: 'goodbye',
                    text: 'İyi şanslar yolcu! Nil bereketli olsun!',
                    options: []
                }
            ],
            location: 'misir',
            position: { x: -3, y: 0, z: 5 }
        },
        {
            id: 'guard_captain',
            name: 'Muhafız Kaptanı Bek',
            role: 'Combat Trainer',
            portrait: 'attack',
            description: 'Set\'in saray muhafızlarının kaptanı.',
            dialogues: [
                {
                    id: 'greeting',
                    text: 'Dur yolcu! Saray bölgesine girmek için iznin var mı? Set\'in emirlerini uygulamakla görevliyim.',
                    options: [
                        { text: 'Vergimi ödedim', next: 'check_tax' },
                        { text: 'Set\'e karşıyım!', next: 'rebel' },
                        { text: 'Çekilirim', next: 'goodbye' }
                    ]
                },
                {
                    id: 'check_tax',
                    text: 'Çantandaki vergi makbuzunu göster. Ayda 50 altın zorunlu!',
                    options: [
                        { text: 'İşte makbuz', action: 'show_tax_receipt', next: 'tax_paid' },
                        { text: 'Ödeyemem...', next: 'arrest' }
                    ]
                },
                {
                    id: 'tax_paid',
                    text: 'Güzel. Geçebilirsin. Ama Set\'in sarayında saygılı ol!',
                    options: [
                        { text: 'Teşekkürler', next: 'goodbye' }
                    ]
                },
                {
                    id: 'arrest',
                    text: 'Vergi kaçakları Duat\'a! Seni Anubis\'e göndüreceğim!',
                    options: [
                        { text: 'Kaç!', action: 'escape_guard', next: 'escape' }
                    ]
                },
                {
                    id: 'rebel',
                    text: 'Ne?! Set\'e karşı mı? Seni hapse atacağım! Ya da... daha fazlasını yapabilirim. Savaşmada bana eşlik et, vergini affederim.',
                    options: [
                        { text: 'Savaşmaya hazırım', action: 'start_combat_training', next: 'training_start' },
                        { text: 'Asla!', next: 'arrest' }
                    ]
                },
                {
                    id: 'training_start',
                    text: 'Cesur! Savaş eğitimi başlıyor. E tuşu ile saldır, hareket et. 5 düşmanı yen ve ödülünü al.',
                    options: [
                        { text: 'Hazırım!', next: 'goodbye' }
                    ]
                },
                {
                    id: 'escape',
                    text: 'Kaçtın ama muhafızlar seni arayacak! Dikkatli ol!',
                    options: []
                },
                {
                    id: 'goodbye',
                    text: 'Hadi geç ama dikkatli ol!',
                    options: []
                }
            ],
            location: 'saray',
            position: { x: 0, y: 0, z: 10 }
        },
        {
            id: 'horus_spirit',
            name: 'Horus\'un Ruhu',
            role: 'God Messenger',
            portrait: 'horus',
            description: 'Gözleri çalınmış tanrının ruhani formu.',
            dialogues: [
                {
                    id: 'greeting',
                    text: 'Bek... Gözlerim olmadan köleyim. Set, piramidin derinliklerinde saklıyor. Onları geri alırsan özgürlüğümü kazanacağım.',
                    options: [
                        { text: 'Gözlerini geri alacağım!', next: 'accept_quest' },
                        { text: 'Bu çok tehlikeli', next: 'hesitant' },
                        { text: 'Nasıl yardım edebilirim?', next: 'instructions' }
                    ]
                },
                {
                    id: 'accept_quest',
                    text: 'Cesur bir ruh! Tapınağa gir, tuzaklardan geç, gözlerimi bul. Tanrı formuna yükselme gücünü sana sunacağım.',
                    options: [
                        { text: 'Hazırım!', action: 'start_quest_steal_eye', next: 'blessing' }
                    ]
                },
                {
                    id: 'hesitant',
                    text: 'Anlıyorum ama düşün... Set\'in zulmü devam ediyor. Tanrıya yükselirsen Nil\'i kurtarabilirsin.',
                    options: [
                        { text: 'Haklısın, yapacağım', next: 'accept_quest' },
                        { text: 'Düşüneyim', next: 'goodbye' }
                    ]
                },
                {
                    id: 'instructions',
                    text: 'Tapınakta khopesh tırpanları, zemin mızrakları ve ezici bloklar var. Hızlı ol, dikkatli ol. Gözlerimi bul!',
                    options: [
                        { text: 'Anlaşıldı', next: 'accept_quest' }
                    ]
                },
                {
                    id: 'blessing',
                    text: 'Tanrıların lütfu üzerine olsun! Başarılar Bek!',
                    options: [
                        { text: 'Teşekkürler Horus', next: 'goodbye' }
                    ]
                },
                {
                    id: 'goodbye',
                    text: 'Gözlerimi bekliyorum...',
                    options: []
                }
            ],
            location: 'horustapinak',
            position: { x: 0, y: 0, z: 0 }
        },
        {
            id: 'anubis',
            name: 'Anubis',
            role: 'Death Judge',
            portrait: 'anubis',
            description: 'Ölüm tanrısı ve ruhların yargıçısı.',
            dialogues: [
                {
                    id: 'greeting',
                    text: 'Ölümlü... Duat\'a hoş geldin. Terazimde ruhunu tartacağım. Yeterli altının varsa dünyaya dönebilirsin.',
                    options: [
                        { text: '50 Altın ödemeye hazırım', action: 'pay_death_tax', next: 'paid' },
                        { text: 'Altınım yok...', next: 'punishment' },
                        { text: 'Yargılanmak istemiyorum', next: 'refuse' }
                    ]
                },
                {
                    id: 'paid',
                    text: 'İyi... Ruhen temiz. Dünyaya dönebilirsin. Ama unutma, her ölüm bedel ister.',
                    options: [
                        { text: 'Dünyaya dön', action: 'revive', next: 'goodbye' }
                    ]
                },
                {
                    id: 'punishment',
                    text: 'Altın yoksa cezan var. Yeraltı madeninde 5 taş kır. Sonra dünyaya dönebilirsin.',
                    options: [
                        { text: 'Cezayı kabul ediyorum', action: 'start_mining_punishment', next: 'mining_start' }
                    ]
                },
                {
                    id: 'mining_start',
                    text: 'Maden aşağıda. Taşları kır, cezanı doldur. Anubis izliyor...',
                    options: [
                        { text: 'Gidiyorum', next: 'goodbye' }
                    ]
                },
                {
                    id: 'refuse',
                    text: 'Yargıdan kaçamazsın! Ya öde ya da cezaya çekil!',
                    options: [
                        { text: 'Tamam, ödeyeceğim', next: 'greeting' },
                        { text: 'Cezayı kabul ediyorum', next: 'punishment' }
                    ]
                },
                {
                    id: 'goodbye',
                    text: 'Terazim her zaman hazır...',
                    options: []
                }
            ],
            location: 'ahiret',
            position: { x: 0, y: 0, z: 0 }
        }
    ];

    class NPCSystem {
        constructor() {
            this.activeNPC = null;
            this.dialogHistory = [];
            this.init();
        }

        init() {
            // NPC markers will be added to the 3D scene by the realm scripts
            console.log('NPC System initialized');
        }

        getNPC(npcId) {
            return NPC_DEFINITIONS.find(npc => npc.id === npcId);
        }

        getNPCsByLocation(location) {
            return NPC_DEFINITIONS.filter(npc => npc.location === location);
        }

        startDialog(npcId) {
            const npc = this.getNPC(npcId);
            if (!npc) return;

            this.activeNPC = npc;
            this.showDialog(npc.dialogues[0]);
        }

        startCharacterDialog(character) {
            if (!character) return;
            const persona = character.personality || {};
            const roleIcons = {
                thief: 'player',
                farmer: 'wheat',
                merchant: 'inventory',
                guard: 'attack',
                priest: 'obelisk',
                goddess: 'horus',
                performer: 'sparkle',
                noble: 'horus',
                god: character.role === 'set_god' ? 'set' : 'horus'
            };

            this.activeNPC = {
                id: character.id,
                name: character.name,
                role: character.title || 'Mısırlı',
                portrait: roleIcons[character.persona] || 'player',
                dialogues: [
                    {
                        id: 'greeting',
                        text: persona.greeting || 'Nil kıyısında işler hiç durmaz. Sana nasıl yardım edebilirim?',
                        options: [
                            { text: 'Şehirde neler oluyor?', next: 'rumor' },
                            { text: 'İşin nasıl gidiyor?', next: 'work' },
                            { text: 'Bir Mısır şakası anlat.', next: 'joke' },
                            { text: 'Görev panosunu aç', action: 'open_quests', next: 'farewell' },
                            { text: 'Görüşürüz', next: 'farewell' }
                        ]
                    },
                    { id: 'rumor', text: persona.rumor || 'Pazarda herkes Set\'in yeni vergisini konuşuyor.', options: [{ text: 'İyi yolculuklar', next: 'farewell' }, { text: 'Bir şey daha soracağım', next: 'greeting' }] },
                    { id: 'work', text: persona.work || 'Bugün de Nil\'in bereketi için çalışıyorum.', options: [{ text: 'Kolay gelsin', next: 'farewell' }, { text: 'Başka bir şey soracağım', next: 'greeting' }] },
                    { id: 'joke', text: persona.joke || 'Bir rahip neden Nil\'e küsmüş? Fazla akıntıya kapılmış!', options: [{ text: 'Güldüm, sağ ol', next: 'farewell' }, { text: 'Daha iyisini dene', next: 'greeting' }] },
                    { id: 'farewell', text: persona.farewell || 'Yolun açık, kesen kapalı olsun. Şaka yaptım... çoğunlukla.', options: [] }
                ]
            };

            this.showDialog(this.activeNPC.dialogues[0]);
        }

        showDialog(dialogue) {
            // Remove existing dialog
            const existing = document.getElementById('npc-dialog-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'npc-dialog-overlay';
            overlay.className = 'fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm';

            const portraitHtml = typeof getIcon === 'function' ? getIcon(this.activeNPC.portrait, 'large') : '';

            overlay.innerHTML = `
                <div class="npc-dialog-content animate-fade-in max-w-lg w-full mx-4">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="npc-dialog-portrait">
                            ${portraitHtml}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="hud-font-title text-lg font-black text-amber-100">${this.activeNPC.name}</h3>
                                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">${this.activeNPC.role}</span>
                            </div>
                            <p class="text-sm text-amber-200/90 leading-relaxed">${dialogue.text}</p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        ${dialogue.options.map((opt, index) => `
                            <button onclick="window.NPCSystem.selectOption(${index}, '${dialogue.id}')" 
                                    class="action-pill-btn px-4 py-2 rounded-xl text-xs font-bold text-left hover:border-amber-400 transition-all">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>

                    <button onclick="window.NPCSystem.closeDialog()" class="absolute top-2 right-2 text-amber-400 hover:text-white text-xl font-bold">
                        ${typeof getIcon === 'function' ? getIcon('close', 'normal') : '×'}
                    </button>
                </div>
            `;

            document.body.appendChild(overlay);

            // Play sound
            if (window.GameAudio) {
                window.GameAudio.playSfx('ui_click');
            }
        }

        selectOption(optionIndex, currentDialogueId) {
            const currentDialogue = this.activeNPC.dialogues.find(d => d.id === currentDialogueId);
            if (!currentDialogue || !currentDialogue.options[optionIndex]) return;

            const option = currentDialogue.options[optionIndex];

            // Execute action if any
            if (option.action) {
                this.executeAction(option.action);
            }

            // Navigate to next dialogue
            if (option.next && option.next !== 'goodbye') {
                const nextDialogue = this.activeNPC.dialogues.find(d => d.id === option.next);
                if (nextDialogue) {
                    this.showDialog(nextDialogue);
                }
            } else {
                this.closeDialog();
            }
        }

        executeAction(action) {
            console.log('Executing action:', action);

            switch(action) {
                case 'open_quests':
                    if (window.GameHUD) window.GameHUD.openModal('quests');
                    break;
                case 'start_quest_tutorial_1':
                    if (window.TutorialSystem) {
                        window.TutorialSystem.startQuest('tutorial_1');
                    }
                    break;
                case 'unlock_quest_steal_eye':
                    if (window.TutorialSystem) {
                        window.TutorialSystem.startQuest('main_2');
                    }
                    break;
                case 'start_quest_steal_eye':
                    if (window.TutorialSystem) {
                        window.TutorialSystem.startQuest('main_2');
                    }
                    break;
                case 'buy_bronze_sword':
                    if (window.GameState) {
                        if (window.GameState.state.inventory.gold >= 100) {
                            window.GameState.addResource('gold', -100);
                            window.GameState.state.inventory.weapons.push('Bronz Kılıç');
                            window.GameHUD.showToast('Bronz Kılıç satın alındı!', 'gold');
                        } else {
                            window.GameHUD.showToast('Yeterli altın yok!', 'danger');
                        }
                    }
                    break;
                case 'buy_croc_armor':
                    if (window.GameState) {
                        if (window.GameState.state.inventory.gold >= 200) {
                            window.GameState.addResource('gold', -200);
                            window.GameHUD.showToast('Timsah Zırhı satın alındı!', 'gold');
                        } else {
                            window.GameHUD.showToast('Yeterli altın yok!', 'danger');
                        }
                    }
                    break;
                case 'show_tax_receipt':
                    if (window.GameHUD) {
                        window.GameHUD.showToast('Vergi makbuzu doğrulandı!', 'system');
                    }
                    break;
                case 'escape_guard':
                    if (window.GameHUD) {
                        window.GameHUD.showToast('Muhafızlardan kaçtın!', 'system');
                    }
                    break;
                case 'start_combat_training':
                    if (window.TutorialSystem) {
                        window.TutorialSystem.startQuest('main_1');
                    }
                    break;
                case 'pay_death_tax':
                    if (window.GameState) {
                        if (window.GameState.state.inventory.gold >= 50) {
                            window.GameState.addResource('gold', -50);
                            window.GameHUD.showToast('Ahiret vergisi ödendi!', 'gold');
                        } else {
                            window.GameHUD.showToast('Yeterli altın yok!', 'danger');
                        }
                    }
                    break;
                case 'revive':
                    if (window.GameState) {
                        window.GameState.state.player.hp = window.GameState.state.player.maxHp;
                        window.GameHUD.showToast('Dünyaya döndün!', 'gold');
                        // Teleport to misir
                        window.location.href = 'mısır.html';
                    }
                    break;
                case 'start_mining_punishment':
                    if (window.GameState) {
                        window.GameState.state.ahiretDebt = 5;
                        window.GameHUD.showToast('Cezanın başladı: 5 taş kır!', 'system');
                    }
                    break;
            }
        }

        closeDialog() {
            const overlay = document.getElementById('npc-dialog-overlay');
            if (overlay) overlay.remove();
            this.activeNPC = null;
        }

        // Create NPC marker in 3D scene (to be called by realm scripts)
        createNPCMarker(scene, npc, position) {
            // This would create a 3D marker for the NPC
            // Implementation depends on the specific realm's 3D setup
            console.log(`NPC marker created for ${npc.name} at position`, position);
        }
    }

    // Initialize
    window.NPCSystem = new NPCSystem();

})(window);
