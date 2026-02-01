<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Tsevie Apegame - Football & Dashboard</title>
    
    <!-- PWA & Mobile Optimization -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Apegame Foot">

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), 
                        url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920');
            background-attachment: fixed;
            background-size: cover;
            background-position: center;
            color: #f3f4f6;
            margin: 0;
        }

        .bg-togo-green { background-color: #006a4e; }
        .bg-togo-yellow { background-color: #ffce00; }
        .bg-togo-red { background-color: #d21034; }
        
        .role-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .role-card:hover {
            transform: translateY(-8px);
            background: rgba(0, 106, 78, 0.6);
            border-color: #ffce00;
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        input, select, textarea {
            background: #ffffff !important;
            color: #1f2937 !important;
            font-size: 16px !important;
            border: 2px solid #e5e7eb !important;
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        footer {
            background: rgba(0, 0, 0, 0.98);
            border-top: 4px solid #ffce00;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffce00; border-radius: 10px; }
    </style>
</head>
<body class="flex flex-col min-h-screen">

    <!-- En-tête -->
    <header class="bg-togo-green text-white pt-16 pb-12 px-4 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-3 bg-togo-red"></div>
        <div class="absolute top-3 left-0 w-full h-3 bg-togo-yellow"></div>
        <div class="max-w-4xl mx-auto text-center relative z-10">
            <h1 class="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter drop-shadow-lg">
                EQUIPE DE FOOTBALL <br><span class="text-togo-yellow">TSEVIE APEGAME</span>
            </h1>
            <div class="flex justify-center gap-4 mt-6">
                <button onclick="showSection('loginSection')" class="bg-white text-togo-green hover:bg-togo-yellow hover:text-black px-8 py-3 rounded-full font-black transition-all shadow-lg scale-105">
                    🔑 MON COMPTE (Dashboard)
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-12 space-y-16 flex-grow w-full">

        <!-- Choix du rôle -->
        <section id="choiceSection" class="text-center space-y-10 animate-fade-in">
            <h2 class="text-3xl font-black uppercase tracking-widest text-white drop-shadow-md">Rejoindre l'aventure</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <button onclick="showSection('playerSection')" class="role-card p-10 rounded-[2.5rem] flex flex-col items-center group">
                    <div class="text-7xl mb-6">🏃‍♂️</div>
                    <div class="text-2xl font-black uppercase text-togo-yellow">Joueur</div>
                    <p class="text-xs mt-2 opacity-70">S'inscrire sur le terrain</p>
                </button>
                <button onclick="showSection('coachSection')" class="role-card p-10 rounded-[2.5rem] flex flex-col items-center group">
                    <div class="text-7xl mb-6">📋</div>
                    <div class="text-2xl font-black uppercase text-blue-400">Encadrant</div>
                    <p class="text-xs mt-2 opacity-70">Gérer l'équipe</p>
                </button>
                <button onclick="showSection('donorSection')" class="role-card p-10 rounded-[2.5rem] flex flex-col items-center group">
                    <div class="text-7xl mb-6">💎</div>
                    <div class="text-2xl font-black uppercase text-togo-red">Donateur</div>
                    <p class="text-xs mt-2 opacity-70">Soutenir le projet</p>
                </button>
            </div>
        </section>

        <!-- Section Connexion Dashboard -->
        <section id="loginSection" class="hidden glass-panel max-w-md mx-auto p-10 rounded-[3rem] animate-fade-in shadow-2xl">
            <h2 class="text-2xl font-black text-center mb-6 uppercase text-white">Accès à mon compte</h2>
            <p class="text-center text-xs mb-6 opacity-80">Connectez-vous avec votre nom complet utilisé lors de l'inscription.</p>
            <div class="space-y-4">
                <input id="loginName" type="text" placeholder="Ex: Jean Kouassi" class="w-full p-4 rounded-2xl outline-none font-bold">
                <button onclick="handleLogin()" class="w-full bg-togo-yellow text-black font-black py-4 rounded-2xl hover:brightness-110 transition-all shadow-lg uppercase">Ouvrir mon Dashboard</button>
                <button onclick="resetToChoice()" class="w-full text-white/60 text-sm hover:text-white transition-colors">Retour à l'accueil</button>
            </div>
        </section>

        <!-- Dashboard Utilisateur Personnel -->
        <section id="userDashboard" class="hidden bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in text-gray-800">
            <div class="bg-gray-900 text-white p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="text-center md:text-left">
                    <p class="text-togo-yellow text-xs font-black uppercase tracking-widest">Espace Personnel Sécurisé</p>
                    <h2 id="dashName" class="text-3xl font-black uppercase">Chargement...</h2>
                    <span id="dashRole" class="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20 mt-2 inline-block">Rôle</span>
                </div>
                <button onclick="resetToChoice()" class="bg-red-500/20 text-red-400 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">Déconnexion</button>
            </div>
            <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-black flex items-center"><span class="mr-2">🔔</span> MESSAGES & INFOS</h3>
                    </div>
                    <div id="userNotifications" class="space-y-4 max-h-96 overflow-y-auto pr-2">
                        <p class="text-gray-400 italic">Recherche de vos messages personnels et publics...</p>
                    </div>
                </div>
                <div class="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <h3 class="font-black text-gray-400 uppercase text-xs mb-6 tracking-widest">Informations Enregistrées</h3>
                    <div id="userInfoDisplay" class="space-y-4"></div>
                </div>
            </div>
        </section>

        <!-- Formulaire Joueur -->
        <section id="playerSection" class="hidden bg-white rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-togo-green animate-fade-in text-gray-800">
            <div class="bg-togo-green text-white px-8 py-6 flex justify-between items-center">
                <h2 class="text-2xl font-black uppercase">Fiche Inscription Joueur</h2>
                <button onclick="resetToChoice()" class="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold">Annuler</button>
            </div>
            <form id="playerForm" onsubmit="handleRegistration(event, 'registrations')" class="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-xs font-black text-gray-400 ml-2 uppercase">Nom complet</label>
                    <input required id="p-fullname" placeholder="Votre Nom et Prénom" class="w-full p-4 rounded-2xl outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-gray-400 ml-2 uppercase">Âge</label>
                    <input required id="p-age" type="number" placeholder="Âge" class="w-full p-4 rounded-2xl outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-gray-400 ml-2 uppercase">Poste préféré</label>
                    <select id="p-position" class="w-full p-4 rounded-2xl outline-none">
                        <option value="Gardien">Gardien</option><option value="Défenseur">Défenseur</option>
                        <option value="Milieu">Milieu</option><option value="Attaquant">Attaquant</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-gray-400 ml-2 uppercase">Numéro WhatsApp</label>
                    <input required id="p-phone" placeholder="+228 XX XX XX XX" class="w-full p-4 rounded-2xl outline-none">
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-gray-400 ml-2 uppercase">Cri de guerre / Motivation</label>
                    <input required id="p-war-cry" placeholder="Ex: Ensemble pour la victoire !" class="w-full p-4 rounded-2xl border-togo-yellow bg-togo-yellow/5 font-bold outline-none">
                </div>
                <button type="submit" class="md:col-span-2 bg-togo-green text-white font-black py-5 rounded-2xl uppercase shadow-xl hover:bg-togo-green/90 transition-all">Valider mon inscription</button>
            </form>
        </section>

        <!-- Formulaire Coach -->
        <section id="coachSection" class="hidden bg-white rounded-[3rem] p-10 animate-fade-in text-gray-800">
            <div class="flex justify-between items-center mb-8"><h2 class="text-2xl font-black uppercase text-blue-600">Postuler comme Encadrant</h2><button onclick="resetToChoice()" class="text-gray-400 font-bold uppercase text-xs">Fermer</button></div>
            <form onsubmit="handleRegistration(event, 'coaches')" class="grid gap-4">
                <input required id="c-fullname" placeholder="Nom Complet" class="p-4 border-2 rounded-2xl font-bold">
                <input required id="c-phone" placeholder="Contact WhatsApp" class="p-4 border-2 rounded-2xl font-bold">
                <textarea required id="c-experience" placeholder="Décrivez votre expérience ou motivation..." class="p-4 border-2 rounded-2xl h-32 font-medium"></textarea>
                <button type="submit" class="bg-blue-600 text-white font-black py-4 rounded-2xl uppercase shadow-lg">Envoyer ma candidature</button>
            </form>
        </section>

        <!-- Formulaire Donateur -->
        <section id="donorSection" class="hidden bg-white rounded-[3rem] p-10 animate-fade-in text-gray-800">
             <div class="flex justify-between items-center mb-8"><h2 class="text-2xl font-black uppercase text-togo-red">Devenir Donateur</h2><button onclick="resetToChoice()" class="text-gray-400 font-bold uppercase text-xs">Fermer</button></div>
             <form onsubmit="handleRegistration(event, 'donations')" class="grid gap-4">
                <input required id="d-fullname" placeholder="Votre Nom ou Entreprise" class="p-4 border-2 rounded-2xl font-bold">
                <input required id="d-phone" placeholder="Numéro de contact" class="p-4 border-2 rounded-2xl font-bold">
                <textarea required id="d-gift" placeholder="Détails du don ou type de soutien (matériel, financier...)" class="p-4 border-2 rounded-2xl h-32 font-medium"></textarea>
                <button type="submit" class="bg-togo-red text-white font-black py-4 rounded-2xl uppercase shadow-lg">Soumettre le soutien</button>
            </form>
        </section>

        <!-- Accès Admin (Bas de page) -->
        <section id="adminAccessSection" class="pt-20">
            <div class="max-w-md mx-auto">
                <button onclick="toggleAdmin()" class="role-card w-full p-8 rounded-[2.5rem] flex flex-col items-center group">
                    <div class="text-5xl mb-4">🛡️</div>
                    <div class="text-xl font-black uppercase text-white group-hover:text-togo-yellow">Accès Administration Paroissiale</div>
                    <p class="text-[10px] mt-2 opacity-50 uppercase tracking-widest text-white/60">Réservé au bureau</p>
                </button>
            </div>
        </section>

        <!-- Panneau Admin -->
        <section id="adminPanel" class="hidden bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-togo-yellow animate-fade-in text-gray-800">
            <div class="flex justify-between items-center mb-8 border-b pb-4">
                <h3 class="text-3xl font-black uppercase text-togo-green">Espace Gestion</h3>
                <button onclick="resetToChoice()" class="bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-xs">QUITTER L'ADMIN</button>
            </div>

            <!-- Diffusion Notifications -->
            <div class="mb-12 bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                <h4 class="font-black text-togo-yellow uppercase text-xs mb-6 tracking-widest">Diffuser une information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 ml-2">Destinataire</label>
                        <select id="notifTarget" class="w-full p-4 rounded-xl border-none text-black font-bold">
                            <option value="PUBLIC">📢 TOUT LE MONDE (PUBLIC)</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 ml-2">Objet du message</label>
                        <input id="notifTitle" placeholder="Ex: Entraînement demain" class="w-full p-4 rounded-xl border-none text-black font-bold">
                    </div>
                    <div class="flex items-end">
                        <button onclick="sendNotification()" class="w-full bg-togo-green text-white rounded-xl font-black py-4 hover:scale-105 transition-all">PUBLIER LE MESSAGE</button>
                    </div>
                    <div class="md:col-span-3 space-y-2 mt-2">
                        <label class="text-[10px] uppercase opacity-60 ml-2">Contenu du message</label>
                        <textarea id="notifMsg" placeholder="Votre texte ici..." class="w-full p-4 rounded-xl border-none text-black h-24 font-medium"></textarea>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <h4 class="font-black text-togo-green uppercase border-b-2 border-togo-green mb-4 flex justify-between">Joueurs <span id="count-registrations" class="text-xs opacity-50">0</span></h4>
                    <div id="adminTableBody" class="space-y-2 max-h-96 overflow-y-auto pr-2"></div>
                </div>
                <div>
                    <h4 class="font-black text-blue-600 uppercase border-b-2 border-blue-600 mb-4 flex justify-between">Staff <span id="count-coaches" class="text-xs opacity-50">0</span></h4>
                    <div id="adminCoachBody" class="space-y-2 max-h-96 overflow-y-auto pr-2"></div>
                </div>
                <div>
                    <h4 class="font-black text-togo-red uppercase border-b-2 border-togo-red mb-4 flex justify-between">Dons <span id="count-donations" class="text-xs opacity-50">0</span></h4>
                    <div id="donorTableBody" class="space-y-2 max-h-96 overflow-y-auto pr-2"></div>
                </div>
            </div>
        </section>

    </main>

    <footer class="mt-12 py-12 px-6 text-center text-white">
        <div class="max-w-4xl mx-auto space-y-8">
            <div class="flex justify-center gap-10 text-3xl mb-4">
                <span>⚽</span><span>⛪</span><span>📢</span>
            </div>
            
            <div class="bg-black p-10 rounded-[2.5rem] border-4 border-togo-yellow shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <p class="text-togo-yellow font-black uppercase text-base tracking-[0.4em] mb-8">🚀 LANCEMENT OFFICIEL</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div class="text-center md:text-right border-r-0 md:border-r-2 border-white/20 pr-0 md:pr-12">
                        <p class="text-xs text-togo-yellow uppercase font-black mb-2 opacity-80">DATE PRÉVUE</p>
                        <p class="text-4xl font-black text-white drop-shadow-md">15 Février 2025</p>
                    </div>
                    <div class="text-center md:text-left pl-0 md:pl-12">
                        <p class="text-xs text-togo-yellow uppercase font-black mb-2 opacity-80">LIEU DE RENCONTRE</p>
                        <p class="text-4xl font-black text-white drop-shadow-md">Paroisse Apegame</p>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <p class="text-2xl font-black text-togo-yellow tracking-tighter uppercase">PAROISSE DE TSÉVIÉ APEGAME</p>
                <p class="text-sm italic opacity-90">"Un esprit sain dans un corps sain — Pour la gloire de Dieu."</p>
            </div>

            <div class="pt-8 border-t border-white/10 text-[10px] opacity-40 uppercase tracking-widest font-bold">
                &copy; 2025 EQUIPE DE FOOTBALL PAROISSIALE APEGAME | TOUS DROITS RÉSERVÉS
            </div>
        </div>
    </footer>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, query, getDocs, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

        const firebaseConfig = JSON.parse(__firebase_config);
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'tsevie-final-v1';

        let currentUser = null;
        let loggedProfile = null; // Profil stocké après login

        // Auth Init
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else { await signInAnonymously(auth); }
        };

        // Sync Admin Data
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                const syncList = (coll, containerId, countId, accent) => {
                    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', coll)), (s) => {
                        const list = document.getElementById(containerId);
                        const countEl = document.getElementById(countId);
                        const select = document.getElementById('notifTarget');
                        list.innerHTML = '';
                        countEl.innerText = s.size;
                        
                        s.forEach(doc => {
                            const d = doc.data();
                            list.innerHTML += `
                                <div class="bg-gray-100 p-4 rounded-2xl border-l-8 ${accent} transition-all hover:bg-white shadow-sm">
                                    <p class="font-black text-sm uppercase">${d.fullname}</p>
                                    <p class="text-[10px] opacity-60 font-bold">${d.phone} ${d.position ? '| ' + d.position : ''}</p>
                                </div>
                            `;
                            // Ajouter aux cibles de notifications
                            if(![...select.options].some(o => o.value === d.fullname)) {
                                select.innerHTML += `<option value="${d.fullname}">${coll === 'registrations' ? 'Joueur' : 'Staff'}: ${d.fullname}</option>`;
                            }
                        });
                    }, (err) => console.error(err));
                };

                syncList('registrations', 'adminTableBody', 'count-registrations', 'border-togo-green');
                syncList('coaches', 'adminCoachBody', 'count-coaches', 'border-blue-600');
                syncList('donations', 'donorTableBody', 'count-donations', 'border-togo-red');
            }
        });

        // Login Handler
        window.handleLogin = async () => {
            const name = document.getElementById('loginName').value.trim();
            if(!name) return;
            const btn = event.target;
            btn.innerText = "ACCÈS...";
            btn.disabled = true;

            const colls = ['registrations', 'coaches', 'donations'];
            let found = false;
            for(const c of colls) {
                const q = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', c));
                q.forEach(doc => {
                    if(doc.data().fullname.toLowerCase() === name.toLowerCase()) {
                        loggedProfile = { ...doc.data(), type: c };
                        found = true;
                    }
                });
                if(found) break;
            }

            btn.innerText = "OUVRIR MON DASHBOARD";
            btn.disabled = false;

            if(found) openDashboard();
            else alert("Nom non reconnu. Assurez-vous d'utiliser le nom exact fourni lors de l'inscription.");
        };

        const openDashboard = () => {
            document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
            document.getElementById('userDashboard').classList.remove('hidden');
            document.getElementById('dashName').innerText = loggedProfile.fullname;
            
            const roleLabels = { 'registrations': 'JOUEUR OFFICIEL', 'coaches': 'MEMBRE DU STAFF', 'donations': 'DONATEUR / PARRAIN' };
            document.getElementById('dashRole').innerText = roleLabels[loggedProfile.type];
            
            // Afficher infos perso
            const info = document.getElementById('userInfoDisplay');
            info.innerHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-white rounded-2xl shadow-sm"><p class="text-[10px] opacity-40 font-black uppercase">Contact</p><p class="font-bold">${loggedProfile.phone}</p></div>
                    ${loggedProfile.age ? `<div class="p-4 bg-white rounded-2xl shadow-sm"><p class="text-[10px] opacity-40 font-black uppercase">Âge</p><p class="font-bold">${loggedProfile.age} ans</p></div>` : ''}
                    ${loggedProfile.position ? `<div class="p-4 bg-white rounded-2xl shadow-sm"><p class="text-[10px] opacity-40 font-black uppercase">Poste</p><p class="font-bold">${loggedProfile.position}</p></div>` : ''}
                </div>
            `;

            // Charger notifications (Publiques + Perso)
            onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), orderBy('timestamp', 'desc')), (s) => {
                const container = document.getElementById('userNotifications');
                container.innerHTML = '';
                let count = 0;
                s.forEach(doc => {
                    const n = doc.data();
                    if(n.target === 'PUBLIC' || n.target === loggedProfile.fullname) {
                        count++;
                        container.innerHTML += `
                            <div class="p-6 rounded-[2rem] shadow-sm animate-fade-in ${n.target === 'PUBLIC' ? 'bg-togo-green/10 border-l-8 border-togo-green' : 'bg-blue-600/10 border-l-8 border-blue-600'}">
                                <h4 class="font-black text-sm uppercase mb-1">${n.title}</h4>
                                <p class="text-sm">${n.message}</p>
                            </div>`;
                    }
                });
                if(count === 0) container.innerHTML = '<p class="text-gray-400 italic text-center py-10">Aucun message pour le moment.</p>';
            });
        };

        // Admin Notification Sender
        window.sendNotification = async () => {
            if(!currentUser) return;
            const target = document.getElementById('notifTarget').value;
            const title = document.getElementById('notifTitle').value.trim();
            const message = document.getElementById('notifMsg').value.trim();
            if(!title || !message) return;

            try {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
                    target, title, message, timestamp: Timestamp.now()
                });
                alert("Message envoyé avec succès !");
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifMsg').value = '';
            } catch (e) { alert("Erreur d'envoi."); }
        };

        // Form Registration
        window.handleRegistration = async (event, coll) => {
            event.preventDefault();
            const form = event.target;
            const btn = form.querySelector('button[type="submit"]');
            const data = {};
            form.querySelectorAll('input, select, textarea').forEach(el => {
                const key = el.id.split('-')[1];
                data[key] = el.value;
            });
            btn.disabled = true;
            try {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', coll), data);
                alert("Inscription réussie !");
                form.reset();
                resetToChoice();
            } catch (e) { alert("Erreur réseau."); }
            finally { btn.disabled = false; }
        };

        initAuth();
    </script>

    <script>
        function showSection(id) {
            document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
            document.getElementById(id).classList.remove('hidden');
            const adminTrigger = document.getElementById('adminAccessSection');
            if(id === 'choiceSection') adminTrigger.classList.remove('hidden');
            else adminTrigger.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        function resetToChoice() { showSection('choiceSection'); }
        function toggleAdmin() {
            const code = prompt("Code d'accès Administration :");
            if (code === "APEGAME2025") showSection('adminPanel');
            else if (code !== null) alert("Code incorrect.");
        }
    </script>
</body>
</html>
