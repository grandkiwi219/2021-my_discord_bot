module.exports = (help, ia) => {
    let data = {
        name: ia.name || help.name,
        description: ia.description || help.description
    }

    if (ia.options.length > 0) data.options = ia.options;

    return data;
}
