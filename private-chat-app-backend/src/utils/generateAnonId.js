export const generateAnonId = (memberCount) => {
    const prefixes = ['User', 'Member', 'Guest', 'Anon'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}${memberCount + 1}`;
};

