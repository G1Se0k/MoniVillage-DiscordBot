const {StringSelectMenuBuilder, SlashCommandBuilder,PermissionFlagsBits, StringSelectMenuOptionBuilder,
    ActionRowBuilder
} = require('discord.js');
const test = require("node:test");
const {execute} = require("../../events/ready");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setting')
        .setDescription('모니마을을 위한 MBTI 선택기를 세팅합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        
        const select = new StringSelectMenuBuilder()
            .setCustomId('MBTI')
            .setPlaceholder('당신의 MBTI를 선택해주세요')
            .addOptions(
                ItemCreator('ISTP'),
                ItemCreator('ISTJ'),
                ItemCreator('ISFP'),
                ItemCreator('ISFJ'),
                ItemCreator('INTP'),
                ItemCreator('INTJ'),
                ItemCreator('INFP'),
                ItemCreator('INFJ'),
                ItemCreator('ESTP'),
                ItemCreator('ESTJ'),
                ItemCreator('ESFP'),
                ItemCreator('ESFJ'),
                ItemCreator('ENTP'),
                ItemCreator('ENTJ'),
                ItemCreator('ENFP'),
                ItemCreator('ENFJ'),
                ItemCreator('비공개'),
            );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.channel.send({
            components : [row]
        });
        
        await interaction.reply({
            content : 'MBTI 선택기가 생성되었어요!\n\n하단에 조그마한 \'메세지 닫기 버튼\'으로\n해당 메세지를 삭제 할 수 있어요!',
            ephemeral : true
        });
    }
}

function ItemCreator(text){
    return new StringSelectMenuOptionBuilder()
        .setLabel(text)
        .setValue(text==='비공개' ? 'NONE' : text)
}