class AgentService {
  async run(input) {
    return {
      response: `Agent placeholder ready for: ${input}`,
      status: 'ready',
    };
  }
}

module.exports = { AgentService };
