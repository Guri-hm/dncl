module.exports = function (results) {
    return results
        .map(result => {
            return result.messages
                .map(message => {
                    return message.message; // メッセージのみを取り出し
                })
                .join('\n');
        })
        .join('\n');
};