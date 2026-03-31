class ListingCommand {
  async execute() {
    throw new Error('Command execute() must be implemented');
  }
}

module.exports = ListingCommand;

