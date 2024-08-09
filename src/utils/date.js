// Função para adicionar um zero à esquerda para números menores que 10
const _twoDigitsLength = (valor) => {
    return valor < 10 ? '0' + valor : valor;
}
const getDateHour = (date) => {
    // Formatando a data manualmente
    const dateObject = new Date(date);

    const formatedDate = _twoDigitsLength(dateObject.getDate()) + '/' +
        _twoDigitsLength(dateObject.getMonth() + 1) + '/' +
        dateObject.getFullYear().toString().slice(2) + ' ' +
        _twoDigitsLength(dateObject.getHours()) + ':' +
        _twoDigitsLength(dateObject.getMinutes());

    return formatedDate
}

module.exports = {
    getDateHour
}
