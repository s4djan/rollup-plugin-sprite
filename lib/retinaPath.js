module.exports = (path, retinaSufix) => {
    
    const pathArray = path.split('.');

    pathArray[pathArray.length - 2] = pathArray[pathArray.length - 2] + retinaSufix;

    return pathArray.join('.');

}