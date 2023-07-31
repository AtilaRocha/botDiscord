const { SlashCommandBuilder } = require("discord.js");

const perguntas = [
  "Nome:",
  "Hobbies:",
  "Interesses pessoais:",
  "Estudando? O que?:",
  "Por que você gostou dessa parada?:",
  "Linguagens que já digitou mais que um 'hello world':",
  "Me cita uma situação em que alguém disse que não gostou de alguma coisa que você fez sem dar muita explicação. O que aconteceu? Como você lidou com isso?:",
  "Me mostra seus projetos se já tiver algum:",
];

const respostas = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cadastro")
    .setDescription("Realiza cadastro de pessoas"),

  async execute(interaction) {
    const authorId = interaction.user.id;

    if (!respostas[authorId]) {
      respostas[authorId] = [];
      await interaction.reply("Vamos começar o cadastro!");

      // Função para fazer as perguntas sequencialmente
      async function fazerPerguntas(indicePergunta) {
        if (indicePergunta >= perguntas.length) {
          // Quando não houver mais perguntas, finaliza o cadastro
          await interaction.followUp({
            content:
              "Obrigado por responder a todas as perguntas!\nAguarde o feedback, qualquer dúvida entre em contato.",
            ephemeral: true,
          });
          return;
        }

        const pergunta = perguntas[indicePergunta];
        await interaction.followUp(pergunta);

        try {
          const collector = interaction.channel.createMessageCollector({
            filter: (msg) => msg.author.id === authorId,
            max: 1, // Coleta apenas uma mensagem
            time: 180000, // 3 minutos de tempo para responder cada pergunta
          });

          collector.on("collect", (msg) => {
            respostas[authorId].push(msg.content);
            fazerPerguntas(indicePergunta + 1); // Chama recursivamente para a próxima pergunta
          });

          await new Promise((resolve) => collector.on("end", resolve));
        } catch (error) {
          await interaction.followUp(
            "Tempo limite atingido. Perguntas encerradas."
          );
          return;
        }
      }

      // Inicia o processo de fazer as perguntas começando da primeira
      fazerPerguntas(0);
    } else {
      // Caso o usuário já tenha respondido às perguntas
      await interaction.reply({
        content:
          "Você já realizou o cadastro anteriormente. Caso precise atualizar suas respostas, entre em contato com a equipe de suporte.",
        ephemeral: true,
      });
    }
  },
};
