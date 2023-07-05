function loadCommands(client) {
    const ascii = require('ascii-table');
    const fs = require('fs');
    const table = new ascii().setHeading('Commands', 'Status');
  
    let commandsArray = [];
  
    const commandsFolder = fs.readdirSync('./Commands');
    for (const folder of commandsFolder) {
      const commandFiles = fs
        .readdirSync(`./Commands/${folder}`)
        .filter((file) => file.endsWith('.js'));
  
      for (const file of commandFiles) {
        try {
          const commandFile = require(`../Commands/${folder}/${file}`);
          client.commands.set(commandFile.data.name, commandFile);
          commandsArray.push(commandFile.data.toJSON());
          table.addRow(file, '💹');
        } catch (error) {
          const errorMessage = error.message || 'Unknown error occurred';
          table.addRow(file, `❌ Error: ${errorMessage}`);
          console.log(`Error loading command "${file}":`, `${errorMessage}`);
        }
      }
    }
  
    client.application.commands.set(commandsArray);
  
    return console.log(table.toString(), '\nLoaded Commands');
  }
  
  module.exports = { loadCommands };
  