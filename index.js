const Discord = require('discord.js')

const client = new Discord.Client({

    intents: 32767

})

const tw = require('@fortune-inc/tw-voucher')

const config = require('./config.json')

const { REST } = require("@discordjs/rest");

const { Routes } = require("discord-api-types/v9");

const fs = require('fs');





let commands = [];

fs.readdir('commands', (err, files) => {

    if (err) throw err;

    files.forEach(async (f) => {

        try {

            let props = require(`./commands/${f}`);

            commands.push({

                name: props.name,

                description: props.description,

                options: props.options

            });

        } catch (err) {

            console.log(err);

        }

    });

});

client.on('interactionCreate', async (interaction) => {

	if (interaction.type != 2) return;
    fs.readdir('commands', (err, files) => {

        if (err) throw err;

        files.forEach(async (f) => {

            let props = require(`./commands/${f}`);

            if (interaction.commandName.toLowerCase() === props.name.toLowerCase()) {

                try {

                    if ((props?.permissions?.length || [].length) > 0) {

                        (props?.permissions || [])?.map(perm => {

                            if (interaction.member.permissions.has(config.permissions[perm])) {

                                return props.run(client, interaction);

                            } else {

                                return interaction.reply({ content: `Missing permission: **${perm}**`, ephemeral: true });

                            }

                        })

                    } else {

                        return props.run(client, interaction);

                    }

                } catch (e) {

                    return interaction.reply({ content: `Something went wrong...\n\n\`\`\`${e.message}\`\`\``, ephemeral: true });

                }

            }

        });

    });

});

const rest = new REST({ version: "9" }).setToken(config.token);

client.once("ready", () => {

    (async () => {

        try {

            await rest.put(Routes.applicationCommands(client.user.id), {

                body: await commands,

            });

            console.log("Successfully reloaded application [/] commands.");

        } catch { };

    })();

});

client.login(config.token)



client.on('messageCreate', async message => {

    if(message.content === "!setup"){

        const Embed = new Discord.EmbedBuilder()

            .setColor('Blue')

            .setTitle('<:opened_gift_small:997514668044197888> เติมเงินด้วยซองอังเปา TrueWallet')

            .setDescription('อ่านก่อนเติมเงิน\n1.เติมตามราคาชื่อห้องด้านบน\n2.บอทจะให้ยศตามจำนวนเงินที่เติมเข้ามา\n3.ไม่มีการคืนเงิน')

            .setImage('https://www.checkraka.com/uploaded/img/content/130026/aungpao_truewallet_01.jpg')

        const row = new Discord.ActionRowBuilder()

            .addComponents(

                new Discord.ButtonBuilder()

                    .setCustomId('เติมเงิน')

                    .setLabel('กดเพื่อเติมเงิน')

                    .setEmoji('<:opened_gift_small:997514668044197888>')

                    .setStyle('PRIMARY')

            );

        message.channel.send({ embeds: [Embed], components: [row]})

    }

})



client.on('ready', () => {

    console.log(client.user.tag)

})





client.on("interactionCreate", async (interaction) => {



    if (interaction.isButton()) {

        if (interaction.customId == "เติมเงิน") {

            const modal = new Discord.ModalBuilder()

                .setCustomId('topup')

                .setTitle('ซองอังเปา');

            const codeInput = new Discord.TextInputBuilder()

                .setCustomId('codeInput')

                .setLabel("ลิ้งค์ซองอังเปา")

                .setPlaceholder('https://gift.truemoney.com/campaign/?v=xxxxxxxxxxxxxxx')

                .setStyle(Discord.TextInputStyle.Short);

            const codeInputActionRow = new Discord.ActionRowBuilder().addComponents(codeInput);

            modal.addComponents(codeInputActionRow);

            await interaction.showModal(modal);

        }

    }

    if (interaction.type === 5){

        if (interaction.customId === "topup") {

            const codeInput =  interaction.fields.getTextInputValue('codeInput')

            console.log(codeInput)

            if(!codeInput.includes("https://gift.truemoney.com/campaign/?v")) return await interaction.guild.channels.cache.get("999766442687860827").send({ embeds: [new Discord.EmbedBuilder().setColor("Red").setDescription(`เลิกพยายามเถอะมันดูโง่ไอควาย <@${interaction.user.id}>`)]})

            tw(config.phone, codeInput).then(async re => {

                switch  (re.amount) {

                        case 20:

                            if(interaction.member.roles.cache.has(config.role20)){

                                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ : คุณมียศอยู่แล้ว")], ephemeral: true})

                                await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                    new Discord.EmbedBuilder()

                                    .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                    .addFields({

                                        name: `คุณได้รับยศ`,

                                        value: `• <@&${config.role20}>`

                                    })

                                    .setColor("Green")

                                ]})

                            }else{

                                await interaction.member.roles.add(config.role20)

                                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ")], ephemeral: true})

                                await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                    new Discord.EmbedBuilder()

                                    .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                    .addFields({

                                        name: `คุณได้รับยศ`,

                                        value: `• <@&${config.role20}>`

                                    })

                                    .setColor("Green")

                                ]})

                            }



                        break;

                            case 30:

                                if(interaction.member.roles.cache.has(config.role30)){

                                    await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ : คุณมียศอยู่แล้ว")], ephemeral: true})

                                    await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                        new Discord.EmbedBuilder()

                                        .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                        .addFields({

                                            name: `คุณได้รับยศ`,

                                            value: `• <@&${config.role30}>`

                                        })

                                        .setColor("Green")

                                    ]})

                                }else{

                                    await interaction.member.roles.add(config.role30)

                                    await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ")], ephemeral: true})

                                    await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                        new Discord.EmbedBuilder()

                                        .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                        .addFields({

                                            name: `คุณได้รับยศ`,

                                            value: `• <@&${config.role30}>`

                                        })

                                       

                                      

                                      

                                      

                          

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              

                                                              .setColor("Green")

                                    ]})

                                }



     

                            break;

                                case 40:

                                    if(interaction.member.roles.cache.has(config.role40)){

                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ : คุณมียศอยู่แล้ว")], ephemeral: true})

                                        await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                            new Discord.EmbedBuilder()

                                            .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                            .addFields({

                                                name: `คุณได้รับยศ`,

                                                value: `• <@&${config.role40}>`

                                            })

                                            .setColor("Green")

                                        ]})

                                    }else{

                                        await interaction.member.roles.add(config.role40)

                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ")], ephemeral: true})

                                        await interaction.guild.channels.cache.get(config.channelSuscess).send({ embeds: [

                                            new Discord.EmbedBuilder()

                                            .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                            .addFields({

                                                name: `คุณได้รับยศ`,

                                                value: `• <@&${config.role40}>`

                                            })

                                            .setColor("Green")

                                        ]})

                                    }

                                break;

                                    case 70:

                                        await interaction.member.roles.add('999009802925658172')

                                        await interaction.member.roles.add('998999975029649469')

                                        await interaction.member.roles.add('997495539606233118')

                                        await interaction.member.roles.add('998878828606787644')

                                        await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Green").setDescription("เติมเงินสำเร็จ")], ephemeral: true})

                                        await interaction.guild.channels.cache.get('999690119936212992').send({ 

                                            embeds: [

                                                new Discord.EmbedBuilder()

                                                .setDescription(`เติมเงินสำเร็จ ${re.amount} โดย <@${interaction.user.id}>`)

                                                .addFields({

                                                    name: `คุณได้รับยศ`,

                                                    value: " •<@&999009802925658172>\n •<@&998999975029649469>\n •<@&997495539606233118>\n •<@&998878828606787644>\n"

                                                })

                                                .setColor("Green")

                                            ]})

                                    break;

                    default:

                        break;

                }

            }).catch(async e => {

                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor("Red").setDescription("ลิงค์ผิดหรืออาจมีคนใช้ไปแล้ว")], ephemeral: true})

            })

        }

    };

})
