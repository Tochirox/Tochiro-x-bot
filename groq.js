import axios from 'axios';
import config from '../config.js';

const GROQ_API_KEY = "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";

const models = {
    'llama': 'llama-3.3-70b-versatile',
    'llama-fast': 'llama-3.1-8b-instant',
    'mixtral': 'mixtral-8x7b-32768',
    'gemma': 'gemma2-9b-it'
};

export default {
    name: 'groq',
    description: 'Pose une question à l\'IA Groq (Llama 3, Mixtral, Gemma)',
    adminOnly: false,
    category: 'general',
    execute: async (sock, msg, args, sender, isGroup, participant, commands) => {
        const prefix = config.config.prefix;
        
        if (args.length === 0) {
            return await sock.sendMessage(sender, {
                text: `╭━━━ *GROQ AI* ━━━
┃
┃ 🚀 Modèles disponibles:
┃ • llama (Llama 3 - Puissant)
┃ • llama-fast (Llama 3 - Rapide)
┃ • mixtral (Mixtral - Contexte long)
┃ • gemma (Gemma - Google)
┃
┃ 📖 *Utilisation:*
┃ ${prefix}groq [question]
┃ ${prefix}groq llama [question]
┃
┃ 📝 *Exemples:*
┃ ${prefix}groq Qu'est-ce que l'IA?
┃ ${prefix}groq llama-fast Code Python
┃
╰━━━━━━━━━━━━━━━
> ${config.config.botName}`
            });
        }
        
        let modelChoice = 'llama';
        let question = args.join(' ');
        
        if (args[0] && models[args[0].toLowerCase()]) {
            modelChoice = args[0].toLowerCase();
            question = args.slice(1).join(' ');
        }
        
        if (!question) {
            return await sock.sendMessage(sender, {
                text: `❌ Pose une question après le modèle\n\nExemple: ${prefix}groq mixtral Comment coder?`
            });
        }
        
        const selectedModel = models[modelChoice];
        
        await sock.sendMessage(sender, {
            text: `🚀 *GROQ AI (${modelChoice.toUpperCase()})*\n\n📝 "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"\n\n⚡ Génération...`
        });
        
        try {
            const startTime = Date.now();
            
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: selectedModel,
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un assistant IA utile, précis et concis. Réponds en français.'
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            
            const answer = response.data.choices[0].message.content;
            const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
            
            let finalText = `╭━━━ *GROQ AI (${modelChoice.toUpperCase()})* ━━━
┃
┃ 🚀 *Question:* 
┃ ${question}
┃
┃ ✨ *Réponse:* 
┃ ${answer}
┃
┃ ⚡ *Temps:* ${responseTime}s
┃
╰━━━━━━━━━━━━━━━
> ${config.config.botName}`;
            
            if (finalText.length > 4096) {
                finalText = finalText.substring(0, 4000) + '\n\n... (réponse tronquée)';
            }
            
            await sock.sendMessage(sender, { text: finalText });
            
        } catch (error) {
            console.error('Groq error:', error);
            
            let errorMsg = '❌ Erreur: ';
            if (error.response?.status === 401) {
                errorMsg = '❌ Clé API Groq invalide';
            } else if (error.code === 'ECONNABORTED') {
                errorMsg += 'Délai dépassé. Réessaie plus tard.';
            } else if (error.response?.status === 429) {
                errorMsg += 'Trop de requêtes. Attends quelques minutes.';
            } else {
                errorMsg += error.message || 'Impossible de contacter l\'API Groq';
            }
            
            await sock.sendMessage(sender, { text: errorMsg });
        }
    }
};