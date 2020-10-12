module.exports = {
  hasLabel: (context, label) => {
    const pr = context.payload.pull_request || context.payload.issue;
    const { labels = [] } = pr;

    return !!labels.find(({ name }) => name === label);
  },
};
