const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    PermissionFlagsBits
} = require('discord.js');

const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

function isValidUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

client.on('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

// ==========================================
// أوامر إنشاء البانلات (Setup Commands)
// ==========================================

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    // 1. بانل التكت (تحكم ديناميكي بأسماء الأقسام)
    if (message.content === '!setup-tickets') {
        const embed = new EmbedBuilder()
            .setTitle(config.texts.ticket_title)
            .setDescription(config.texts.ticket_desc)
            .setColor(config.colors.primary)
            .setFooter({ text: config.texts.ticket_footer });

        if (isValidUrl(config.images.ticket_banner)) embed.setImage(config.images.ticket_banner);

        const ticketOptions = Object.keys(config.ticket_categories || {}).map(key => {
            const cat = config.ticket_categories[key];
            return {
                label: cat.label,
                value: key,
                emoji: cat.emoji || '🎫',
                description: cat.description || ''
            };
        });

        if (ticketOptions.length === 0) {
            return message.reply('❌ لم يتم العثور على أقسام للتكت في ملف config.json!');
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('اختر قسم التكت | Select Category')
            .addOptions(ticketOptions);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(select)] });
    }

    // 2. بانل الاقتراحات
    if (message.content === '!setup-suggestions') {
        const embed = new EmbedBuilder()
            .setTitle(config.texts.suggestion_title)
            .setDescription(config.texts.suggestion_desc)
            .setColor(config.colors.danger);

        if (isValidUrl(config.images.suggestion_banner)) embed.setImage(config.images.suggestion_banner);

        const btn = new ButtonBuilder()
            .setCustomId('btn_suggestion')
            .setLabel('Suggestion')
            .setEmoji('💡')
            .setStyle(ButtonStyle.Success);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
    }

    // 3. بانل طلب الرتبة
    if (message.content === '!setup-role-request') {
        const embed = new EmbedBuilder()
            .setTitle('طلب رتبة | Role Request')
            .setDescription('اضغط على الزر أدناه لتقديم طلب الحصول على رتبة')
            .setColor(config.colors.primary);

        if (isValidUrl(config.images.role_request_banner)) embed.setImage(config.images.role_request_banner);

        const btn = new ButtonBuilder()
            .setCustomId('btn_role_request')
            .setLabel('تقديم طلب')
            .setStyle(ButtonStyle.Primary);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
    }

    // 4. بانل التعميمات
    if (message.content === '!setup-announcement') {
        const embed = new EmbedBuilder()
            .setTitle('announcement')
            .setDescription('اضغط على الزر أدناه لإنشاء تعميم جديد')
            .setColor(config.colors.success);

        if (isValidUrl(config.images.announcement_banner)) embed.setImage(config.images.announcement_banner);

        const btn = new ButtonBuilder()
            .setCustomId('btn_create_announcement')
            .setLabel('announcement')
            .setEmoji('📢')
            .setStyle(ButtonStyle.Secondary);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
    }

    // 5. بانل القوانين
    if (message.content === '!setup-rules') {
        const embed = new EmbedBuilder()
            .setTitle(config.texts.rules_title)
            .setColor(config.colors.primary);

        if (isValidUrl(config.images.rules_banner)) embed.setImage(config.images.rules_banner);

        const select = new StringSelectMenuBuilder()
            .setCustomId('rules_select')
            .setPlaceholder('اختر قسم القوانين')
            .addOptions([
                { label: 'القوانين العامة', value: 'rules_general' },
                { label: 'قوانين الديسكورد', value: 'rules_discord' }
            ]);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(select)] });
    }

    // 6. بانل الاستدعاء
    if (message.content === '!setup-callup') {
        const embed = new EmbedBuilder()
            .setTitle(config.texts.callup_title)
            .setDescription(config.texts.callup_desc)
            .setColor(config.colors.danger);

        if (isValidUrl(config.images.callup_banner)) embed.setImage(config.images.callup_banner);

        const btn = new ButtonBuilder()
            .setCustomId('btn_start_callup')
            .setLabel('بدء الاستدعاء')
            .setStyle(ButtonStyle.Danger);

        await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
    }
});

// ==========================================
// التفاعلات (Interactions)
// ==========================================

client.on('interactionCreate', async (interaction) => {

    // --- أ) التكتات ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const type = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_ticket_${type}`)
            .setTitle('معلومات التذكرة');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('ticket_q1').setLabel('اطرح موضوعك').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('ticket_q2').setLabel('ارفاق تصوير في حال الحاجة').setStyle(TextInputStyle.Short).setRequired(true))
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_ticket_')) {
        const typeKey = interaction.customId.replace('modal_ticket_', '');
        const categoryData = config.ticket_categories?.[typeKey];
        const categoryLabel = categoryData ? categoryData.label : typeKey;

        const q1 = interaction.fields.getTextInputValue('ticket_q1');
        const q2 = interaction.fields.getTextInputValue('ticket_q2');

        await interaction.reply({ content: 'جاري إنشاء التذكرة...', ephemeral: true });

        const member = interaction.member;
        const joinedDays = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
        const createdMonths = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24 * 30));

        const channel = await interaction.guild.channels.create({
            name: `ticket-${member.user.username}`,
            parent: config.bot.category_ticket_id || null,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle('تم فتح التذكرة')
            .setDescription(
                `**Member Info | معلومات العضو**\n` +
                `• **Joined Server:** ${joinedDays} days ago\n` +
                `• **Account Created:** ${createdMonths} months ago\n` +
                `• **Member:** <@${member.id}>\n` +
                `• **Username:** ${member.user.username}\n\n` +
                `**Ticket Info | معلومات التذكرة**\n` +
                `• **Ticket Type:** ${categoryLabel}\n` +
                `• **Status:** Open\n\n` +
                `📌 **ما هي مشكلتك؟**\n${q1}\n\n` +
                `📌 **عندك تصوير؟**\n${q2}`
            )
            .setColor(config.colors.danger)
            .setFooter({ text: `${config.texts.ticket_footer} •${new Date().toLocaleString()}` });

        if (isValidUrl(config.images.ticket_inner)) embed.setImage(config.images.ticket_inner);

        const btnClose = new ButtonBuilder().setCustomId('btn_close_ticket').setLabel('إغلاق التذكرة').setEmoji('🔒').setStyle(ButtonStyle.Danger);
        const btnAdmin = new ButtonBuilder().setCustomId('btn_admin_panel').setLabel('لوحة تحكم الإدارة').setEmoji('🛡️').setStyle(ButtonStyle.Primary);

        await channel.send({ content: `<@${member.id}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(btnClose, btnAdmin)] });
        await interaction.editReply({ content: `تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // --- إغلاق التذكرة مع سجل اللوق (Log) ---
    if (interaction.isButton() && interaction.customId === 'btn_close_ticket') {
        await interaction.reply('🔒 سيتم إغلاق التذكرة وإرسال سجل السجل (Log) خلال 5 ثوانٍ...');

        // البحث عن صاحب التذكرة
        const ticketOwner = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && p.id !== interaction.guild.id);
        const ownerPing = ticketOwner ? `<@${ticketOwner.id}>` : 'غير معروف';

        // إرسال اللوق لروم اللوق المخصص
        const logChannelId = config.bot.ticket_log_channel_id || config.bot.log_channel_id;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const closeLogEmbed = new EmbedBuilder()
                .setTitle('🔒 تم إغلاق تذكرة')
                .setColor(config.colors.danger)
                .addFields(
                    { name: '📁 اسم القناة', value: `\`${interaction.channel.name}\``, inline: true },
                    { name: '👤 صاحب التكت', value: ownerPing, inline: true },
                    { name: '🛠️ تم إغلاقها بواسطة', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Ticket ID: ${interaction.channel.id}` });

            await logChannel.send({ embeds: [closeLogEmbed] }).catch(() => {});
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.isButton() && interaction.customId === 'btn_admin_panel') {
        const select = new StringSelectMenuBuilder()
            .setCustomId('admin_ticket_actions')
            .setPlaceholder('اختر إجراء إداري')
            .addOptions([
                { label: 'استلام التكت', value: 'claim_ticket', emoji: '✅' },
                { label: 'تنبيه عضو', value: 'warn_member', emoji: '🔔' },
                { label: 'إضافة عضو', value: 'add_member', emoji: '➕' }
            ]);

        await interaction.reply({ content: 'خيارات التحكم بالإدارة:', components: [new ActionRowBuilder().addComponents(select)], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'admin_ticket_actions') {
        const action = interaction.values[0];

        if (action === 'claim_ticket') {
            const ticketOwner = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && p.id !== interaction.guild.id);
            const ownerPing = ticketOwner ? `<@${ticketOwner.id}>` : '';
            
            await interaction.channel.send(`• أهلاً ${ownerPing} ! أنا <@${interaction.user.id}> هنا لخدمتك`);
            await interaction.reply({ content: 'تم استلام التذكرة بنجاح.', ephemeral: true });

        } else if (action === 'warn_member') {
            const ticketOwner = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && p.id !== interaction.guild.id);
            if (ticketOwner) {
                const user = await interaction.guild.members.fetch(ticketOwner.id).catch(() => null);
                if (user) {
                    const iconUrl = interaction.guild.iconURL() || '';
                    const warnEmbed = new EmbedBuilder()
                        .setTitle('تذكير تذكرة')
                        .setDescription(`**${interaction.guild.name}** نحن بانتظار ردك في التذكره ${interaction.channel} في سيرفر .\nسيتم إغلاق التذكره تلقائياً بعد 12 ساعة في حال عدم الرد`)
                        .setColor('#093a5b')
                        .setTimestamp();

                    if (isValidUrl(iconUrl)) warnEmbed.setThumbnail(iconUrl);

                    await user.send({ embeds: [warnEmbed] }).catch(() => {});
                    await interaction.reply({ content: 'تم إرسال التذكير بنجاح لصاحب التذكرة!', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'لم يتم العثور على صاحب التذكرة!', ephemeral: true });
            }
        } else if (action === 'add_member') {
            await interaction.reply({ content: 'اكتب أيدي العضو المراد إضافته في الشات.', ephemeral: true });
        }
    }

    // --- ب) الاقتراحات ---
    if (interaction.isButton() && interaction.customId === 'btn_suggestion') {
        const modal = new ModalBuilder().setCustomId('modal_suggestion').setTitle('تقديم اقتراح');
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('sug_text').setLabel('اكتب اقتراحك هنا').setStyle(TextInputStyle.Paragraph).setRequired(true)));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_suggestion') {
        const sugText = interaction.fields.getTextInputValue('sug_text');

        const embed = new EmbedBuilder()
            .setTitle('اقتراح جديد 💡')
            .setDescription(`${sugText}\n\n**صاحب الاقتراح**\n<@${interaction.user.id}>`)
            .setColor(config.colors.primary)
            .setFooter({ text: `Today at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` });

        const msg = await interaction.channel.send({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');

        await interaction.reply({ content: 'تم إرسال اقتراحك بنجاح!', ephemeral: true });
    }

    // --- ج) طلب الرتب ---
    if (interaction.isButton() && interaction.customId === 'btn_role_request') {
        const modal = new ModalBuilder().setCustomId('modal_role_req').setTitle('طلب رتبة');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_name').setLabel('رتبتك المطلوبة').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('proof_url').setLabel('رابط صورة إثباتية').setStyle(TextInputStyle.Short).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_role_req') {
        const roleName = interaction.fields.getTextInputValue('role_name');
        const proofUrl = interaction.fields.getTextInputValue('proof_url');

        const embed = new EmbedBuilder()
            .setTitle('طلب رتبة جديد 🎖️')
            .addFields(
                { name: 'العضو', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'الرتبة المطلوبة', value: roleName, inline: true }
            )
            .setColor(config.colors.warning)
            .setTimestamp();

        if (isValidUrl(proofUrl)) embed.setImage(proofUrl);

        const targetChannel = interaction.guild.channels.cache.get(config.bot.role_claim_channel_id) || interaction.channel;
        await targetChannel.send({ embeds: [embed] });

        await interaction.reply({ content: 'تم إرسال طلبك بنجاح لوج اللوق للإدارة!', ephemeral: true });
    }

    // --- د) التعميمات ---
    if (interaction.isButton() && interaction.customId === 'btn_create_announcement') {
        const modal = new ModalBuilder().setCustomId('modal_announcement').setTitle('إنشاء تعميم جديد');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('anc_msg').setLabel('نص الرسالة').setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('anc_channel').setLabel('أيدي الروم الذي سيرسل فيه التعميم').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('anc_image').setLabel('رابط الصورة (اختياري)').setStyle(TextInputStyle.Short).setRequired(false))
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_announcement') {
        const msgText = interaction.fields.getTextInputValue('anc_msg');
        const channelId = interaction.fields.getTextInputValue('anc_channel');
        const imgUrl = interaction.fields.getTextInputValue('anc_image');

        const targetChannel = interaction.guild.channels.cache.get(channelId);
        if (!targetChannel) return interaction.reply({ content: 'لم يتم العثور على الروم!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(msgText)
            .setColor(config.colors.success);

        if (isValidUrl(imgUrl)) embed.setImage(imgUrl);

        await targetChannel.send({ content: '@everyone', embeds: [embed] });
        await interaction.reply({ content: 'تم إرسال التعميم بنجاح!', ephemeral: true });
    }

    // --- هـ) القوانين ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'rules_select') {
        const choice = interaction.values[0];
        let rulesContent = choice === 'rules_general' ? "1- احترام الجميع.\n2- عدم الترويج." : "1- يمنع التكرار والسبام.";
        await interaction.reply({ content: `**القوانين:**\n${rulesContent}`, ephemeral: true });
    }

    // --- و) الاستدعاء ---
    if (interaction.isButton() && interaction.customId === 'btn_start_callup') {
        const modal = new ModalBuilder().setCustomId('modal_callup').setTitle('استدعاء عضو');
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('callup_userid').setLabel('أيدي العضو المراد استدعاؤه').setStyle(TextInputStyle.Short).setRequired(true)));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_callup') {
        const userId = interaction.fields.getTextInputValue('callup_userid');
        const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!targetMember) return interaction.reply({ content: 'لم يتم العثور على العضو!', ephemeral: true });

        if (config.bot.callup_role_id) await targetMember.roles.add(config.bot.callup_role_id).catch(() => {});

        const iconUrl = interaction.guild.iconURL() || '';
        const callupDmEmbed = new EmbedBuilder()
            .setTitle('تم استدعاءك')
            .setDescription('لقد تم استدعاءك من قبل الإدارة\n\nنتمنى منك التوجه إلى رومات الدعم الاستدعاء مباشرة ة\n\n[في حال عدم توجهك سيتم محاسبتك فوراً]')
            .setColor('#093a5b')
            .setTimestamp();

        if (isValidUrl(iconUrl)) callupDmEmbed.setThumbnail(iconUrl);

        await targetMember.send({ embeds: [callupDmEmbed] }).catch(() => {});

        const logEmbed = new EmbedBuilder()
            .setTitle('🚨 استدعاء')
            .setDescription(`تم استدعاء <@${targetMember.id}> بواسطة <@${interaction.user.id}>.\n\n**Status:**\n⏳ قيد الاستدعاء`)
            .setColor(config.colors.danger)
            .setFooter({ text: `${new Date().toLocaleString()}` });

        const btnEnd = new ButtonBuilder().setCustomId(`btn_end_callup_${targetMember.id}`).setLabel('إنهاء الاستدعاء').setStyle(ButtonStyle.Success);

        const logChannel = interaction.guild.channels.cache.get(config.bot.log_channel_id) || interaction.channel;
        await logChannel.send({ embeds: [logEmbed], components: [new ActionRowBuilder().addComponents(btnEnd)] });

        await interaction.reply({ content: `تم استدعاء <@${targetMember.id}> بنجاح!`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('btn_end_callup_')) {
        const userId = interaction.customId.replace('btn_end_callup_', '');
        const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

        if (targetMember && config.bot.callup_role_id) await targetMember.roles.remove(config.bot.callup_role_id).catch(() => {});

        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`تم استدعاء <@${userId}> بواسطة ${interaction.message.embeds[0].description.split('بواسطة ')[1].split('\n')[0]}\n\n**Status:**\n✅ تم الإنهاء بواسطة <@${interaction.user.id}>`);

        await interaction.update({ embeds: [updatedEmbed], components: [] });
    }
});

client.login(config.bot.token);