import config from '../config.js';

export default {
    name: 'welcome',
    description: 'Gère le message de bienvenue dans le groupe',
    adminOnly: false,
    category: 'group',
    execute: async (sock, msg, args, sender, isGroup, participant) => {
        const prefix = config.config.prefix;
        
        if (!isGroup) {
            return await sock.sendMessage(sender, {
                text: '❌ Cette commande fonctionne uniquement dans les groupes'
            });
        }
        
        const groupId = sender;
        const action = args[0]?.toLowerCase();
        
        if (!action || (action !== 'on' && action !== 'off' && action !== 'test')) {
            const settings = config.getSettings(groupId);
            const status = settings.welcome ? '✅ Activé' : '❌ Désactivé';
            
            return await sock.sendMessage(sender, {
                text: `╭━━━ *WELCOME* ━━━
┃
┃ 📌 *Statut:* ${status}
┃
┃ 📖 *Commandes:*
┃ ${prefix}welcome on   → Activer
┃ ${prefix}welcome off  → Désactiver
┃ ${prefix}welcome test → Aperçu du message
┃
╰━━━━━━━━━━━━━━━
> ${config.config.botName}`
            });
        }
        
        if (action === 'on') {
            config.updateGroupSetting(groupId, 'welcome', true);
            await sock.sendMessage(sender, {
                text: `✅ *Message de bienvenue activé*\n\nLes nouveaux membres recevront un message de bienvenue.`
            });
        } 
        else if (action === 'off') {
            config.updateGroupSetting(groupId, 'welcome', false);
            await sock.sendMessage(sender, {
                text: `❌ *Message de bienvenue désactivé*`
            });
        }
        else if (action === 'test') {
            const groupMetadata = await sock.groupMetadata(groupId);
            const botName = config.config.botName;
            const memberCount = groupMetadata.participants.length;
            const groupDesc = groupMetadata.desc || 'Aucune description';
            const groupName = groupMetadata.subject;
            
            const welcomeText = `╭━━━ *BIENVENUE* ━━━
┃
┃ 👋 *Bienvenue à toi !*
┃
┃ 📌 *Groupe:* ${groupName}
┃ 👥 *Membres:* ${memberCount}
┃ 📝 *Description:*
┃ ${groupDesc.substring(0, 60)}${groupDesc.length > 60 ? '...' : ''}
┃
┃ 🚀 *${botName}* est à ton service
┃ 📖 Tape !menu pour voir les commandes
┃
┃ 💫 *Digital Crew 243*
┃
╰━━━━━━━━━━━━━━━
> Always Forward • One of the best`;
            
            await sock.sendMessage(sender, {
                text: `📝 *Aperçu du message de bienvenue:*\n\n${welcomeText}`
            });
        }
    },
    
    sendWelcome: async (sock, groupId, newMemberJid) => {
        const settings = config.getSettings(groupId);
        if (!settings.welcome) return;
        
        try {
            const groupMetadata = await sock.groupMetadata(groupId);
            const botName = config.config.botName;
            const memberCount = groupMetadata.participants.length;
            const groupDesc = groupMetadata.desc || 'Aucune description';
            const groupName = groupMetadata.subject;
            const memberNumber = newMemberJid.split('@')[0];
            
            const welcomeText = `╭━━━ *BIENVENUE* ━━━
┃
┃ 👋 *Bienvenue @${memberNumber} !*
┃
┃ 📌 *Groupe:* ${groupName}
┃ 👥 *Membres:* ${memberCount}
┃ 📝 *Description:*
┃ ${groupDesc.substring(0, 60)}${groupDesc.length > 60 ? '...' : ''}
┃
┃ 🚀 *${botName}* est à ton service
┃ 📖 Tape !menu pour voir les commandes
┃
┃ 💫 *Digital Crew 243*
┃
╰━━━━━━━━━━━━━━━
> Always Forward • One of the best`;
            
            await sock.sendMessage(groupId, {
                text: welcomeText,
                mentions: [newMemberJid]
            });
            
            console.log(chalk.green(`✓ Message de bienvenue envoyé à ${memberNumber} dans ${groupName}`));
            
        } catch (error) {
            console.error('Welcome error:', error);
        }
    }
};