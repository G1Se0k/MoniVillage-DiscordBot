const { Events } = require('discord.js');

let connectDB = require('./../database')

let db
connectDB.then((client)=>{
    db = client.db('MoniVillage')
}).catch((err)=>{
    console.log(err)
});

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()){

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }else if (interaction.isStringSelectMenu()){
            if (interaction.customId === 'MBTI'){
                let isSucceeded = await setMBTI(interaction);
                if (isSucceeded){
                    await interaction.deferReply({
                        ephemeral : true
                    });
                    await interaction.deleteReply();
                }
                else{
                    await interaction.reply({
                        content: '최근 일주일내에 MBTI를 변경 하였습니다.\n' +
                            '쿨타임[7일] 후 다시 시도하거나, 관리자에게 문의해주세요',
                        ephemeral : true
                    })
                }
            }
        }
    },
};

async function setMBTI(interaction) {
    let result = await db.collection('user').findOne({userID: interaction.user.id, guildID: interaction.guild.id});
    const mbti = await interaction.values[0];
    if (result == null){
        db.collection('user').insertOne({userID: interaction.user.id, guildID: interaction.guild.id, MBTI : mbti, lastEdit : new Date()})
    }
    else{
        let elapsedTime = new Date(new Date() - result.lastEdit).getDate();
        if (elapsedTime <= 7){
            return false;
        }
    }
    
    let symbol = '\u2b1b';

    switch (mbti.substring(0,2)){
        case 'IS':
            symbol = '\ud83d\udfe9';
            break;
        case 'IN':
            symbol = '\ud83d\udfe6';
            break;
        case 'ES':
            symbol = '\ud83d\udfe5';
            break;
        case 'EN':
            symbol = '\ud83d\udfe7';
            break;
    }
    interaction.member.roles.cache.forEach(role => {
        if(role.name === 'Server Booster'){
            symbol = '\ud83d\udfea';
        }
    })

    let nickname;
    if (interaction.member.nickname === null){
        nickname = interaction.user.globalName;
        if (nickname.length < 2){
            nickname += nickname;
        }
        else if (nickname.length > 2){
            nickname = nickname.substring(nickname.length-2, nickname.length+1);
        }
    }
    else{
        nickname = interaction.member.nickname.replaceAll(
            /(\ud83d\udfe9)|(\ud83d\udfe6)|(\ud83d\udfe5)|(\ud83d\udfe7)|(\u2b1b)|(\ud83d\udfea)| /g, ''
        ).substring(0, 2);
    }
    
    nickname = `${symbol} ${nickname}/${mbti === 'NONE' ? 'BABO' : mbti} ${symbol}`;
    

    await interaction.member.setNickname(nickname);

    let oldRole = await interaction.member.roles.cache.filter((role) =>
        role.name === 'IS' ||
        role.name === 'IN' ||
        role.name === 'ES' ||
        role.name === 'EN' ||
        role.name === 'NO');
    let newRole = await interaction.guild.roles.cache.filter((role) => role.name === mbti.substring(0,2));
    
    await interaction.member.roles.remove(oldRole).then(async function(member){
        await member.roles.add(newRole);
    });
    
    await db.collection('user').updateOne({userID: interaction.user.id, guildID: interaction.guild.id},{$set : {MBTI : mbti, lastEdit : new Date()}})
    return true;
}