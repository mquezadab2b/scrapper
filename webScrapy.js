//modules
const cheerio = require('cheerio');
const axios = require('axios');
const mysql = require('mysql');
//definicion parametros conexion mysql
//conexion local
 
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'scrapper'
});
 
 
//conexion Instancia RDS AWS
// var conn = mysql.createConnection({
//     host: 'database-instance-mysql.ck0rw8fyjt0q.us-east-2.rds.amazonaws.com',
//     user: 'admin',
//     password: 'Leica666_',
//     database: 'scraper'
// });
 
//conexion mysql
conn.connect(function (err) {
    // en caso de error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});
//funciones de scrapper categoria/producto por empresa competencia
async function scrapperCategoriasFinning() {
    let name = '';
    let path = '';
    let type = 'categorias';
    let extra = '';
    let company = 'finning';
    let url_tmp = '';
    let category = 'venta';
 
    let url = 'https://www.finning.com/es_CL.html';
    await axios.get(url).then(urlResponse => {
        const category = cheerio.load(urlResponse.data);
        category('div.level4>ul>li').map(async (i, element) => {
            // element
            url_tmp = category(element).find('a').attr('href').trim();
            name = url_tmp.split('/');
            name = name[name.length - 1];
            name = name.replace('.html', '');
            await axios.get(`https://www.finning.com${url_tmp}`).then(urlResponse => {
                const product = cheerio.load(urlResponse.data);
                product('script').map(async (i, element) => {
                    let product = {};
                    if (i == 12) {
                        product = element.children[0].data;
                        product = product.replace('var response =', '');
                        product = product.replace('var pimApp', '');
                        product = product.replace('= (function () {', '');
                        product = product.replace('var instance;', '');
                        product = product.replace('function init() {', '');
                        product = product.replace('return {', '');
                        product = product.replace('return {', '');
                        product = product.replace('getResponse: function () {', '');
                        product = product.replace('return response;', '');
                        product = product.replace('getInstance: function () {', '');
                        product = product.replace('if (!instance) {', '');
                        product = product.replace('instance = init();', '');
                        product = product.replace('return instance;', '');
                        product = product.replace('})();', '');
                        product = product.replace('var pimInstance = pimApp.getInstance();', '');
                        product = product.replace('', '');
                        flag = product.indexOf('"};');
                        flag != -1 ? product = product.substr(0, product.indexOf('"};') + 2) : product = product.substr(0, product.indexOf('"}]};') + 4);
                        product = product.trim();
                        product = JSON.parse(`[${product}]`);
                    }
                    if (product !== undefined) {
                        if (product[0]) {
                            let subProducts = product[0].products;
                            console.log('subProducts', subProducts);
                            if (subProducts.length > 0) {
                                let name = subProducts[0].name ? subProducts[0].name : '';
                                let slug = subProducts[0].slug ? subProducts[0].slug : '';
                                let imageUrl = subProducts[0].imageUrl ? subProducts[0].imageUrl : '';
                                let typeSlug = subProducts[0].typeSlug ? subProducts[0].typeSlug : '';
                                let extId = subProducts[0].extId ? subProducts[0].extId : '';
                                // console.log('SUB PROD', name, slug, imageUrl, typeSlug, extId);
                            }
                        }
                    }
                });
            });
 
        });
        /*    category('div.level4>ul>li').each((i, element) => {
               url_tmp = category(element).find('a').attr('href').trim();
               //name = $(element).find('a').text().trim().toLowerCase();
               name = url_tmp.split('/');
               name = name[name.length - 1];
               name = name.replace('.html', '');
               //name = removeAccents(name);
               // console.log('https://www.finning.com' + url_tmp);
               // save(conn, name, name, path, category, type, extra, company, 'https://www.finning.com' + url_tmp);
               //scrapperProductosFinning('https://www.finning.com'+url_tmp);
               //(async _=> {
               //await console.log(3);
               //await scrapperProductosFinning('https://www.finning.com'+url_tmp);
               //await console.log(4);
               //})();
           }); */
    });
}
 
async function scrapperProductosFinning(url) {
    let name = '';
    let name_match = '';
    let path = '';
    let type = 'productos';
    let extra = '';
    let company = 'finning';
    let url_tmp = '';
    let category = 'venta';
 
    await axios.get(url).then(urlResponse => {
        const $ = cheerio.load(urlResponse.data);
        let str;
        let flag;
        $('script').each((i, element) => {
            if (i == 12) {
                str = element.children[0].data;
                str = str.replace('var response =', '');
                str = str.replace('var pimApp', '');
                str = str.replace('= (function () {', '');
                str = str.replace('var instance;', '');
                str = str.replace('function init() {', '');
                str = str.replace('return {', '');
                str = str.replace('return {', '');
                str = str.replace('getResponse: function () {', '');
                str = str.replace('return response;', '');
                str = str.replace('getInstance: function () {', '');
                str = str.replace('if (!instance) {', '');
                str = str.replace('instance = init();', '');
                str = str.replace('return instance;', '');
                str = str.replace('})();', '');
                str = str.replace('var pimInstance = pimApp.getInstance();', '');
                str = str.replace('', '');
                flag = str.indexOf('"};');
                if (flag != -1)
                    str = str.substr(0, str.indexOf('"};') + 2);
                else
                    str = str.substr(0, str.indexOf('"}]};') + 4);
                str = str.trim();
                str = JSON.parse('[' + str + ']');
                //console.log(str[0]['products']);
            }
        });
        let url_ = url.replace('.html', '');
        if (flag != -1) {
            if (str.length > 0) {
                for (let i = 0; i < str[0]['products'].length; i++) {
                    console.log(url_ + '/' + str[0]['products'][i]['typeSlug'] + '/' + str[0]['products'][i]['extId'] + '.html', str[0]['products'][i]['name'] + ' ' + str[0]['products'][i]['longName']);
                    //name_match = str[0]['products'][i]['name']+' '+str[0]['products'][i]['longName'];
                    name_match = str[0]['products'][i]['longName'];
                    url_tmp = url_ + '/' + str[0]['products'][i]['typeSlug'] + '/' + str[0]['products'][i]['extId'] + '.html';
                    name = url_tmp.split('/');
                    name = name[name.length - 2];
                    name = name.replace('.html', '');
                    name = name + '-' + convertToSlug(name_match);
                    if (str[0]['products'][i]['marketingContent'] !== null) {
                        let marketingContent = str[0]['products'][i]['marketingContent'];
                        for (let j = 0; j < marketingContent.length; j++) {
                            if (marketingContent[j].type == 'gallery-image') {
                                let childContent1 = marketingContent[j].childContent;
                                if (childContent1.length > 0) {
                                    path = childContent1[0].media.source[0].value;
                                }
                            }
                        }
                    }
                    if (path != '' && path != 'undefined' && path != undefined && path != 'null' && path != 'NULL' && path != null)
                        save(conn, name, name_match, path, category, type, extra, company, url_tmp);
                    else
                        save(conn, name, name_match, '', category, type, extra, company, url_tmp);
                }
            }
        }
        else {
            if (str.length > 0) {
                for (let i = 0; i < str[0]['products'].length; i++) {
                    console.log(url_ + '/' + str[0]['products'][i]['extId'] + '.html', str[0]['products'][i]['model']);
                    name_match = str[0]['products'][i]['model'];
                    url_tmp = url_ + '/' + str[0]['products'][i]['extId'] + '.html';
                    name = url_tmp.split('/');
                    name = name[name.length - 2];
                    name = name.replace('.html', '');
 
                    name = name + '-' + convertToSlug(name_match);
 
                    path = str[0]['products'][i]['photos'][0]['url'];
                    if (path != '' && path != 'undefined' && path != undefined && path != 'null' && path != 'NULL' && path != null)
                        save(conn, name, name_match, path, category, type, extra, company, url_tmp);
                    else
                        save(conn, name, name_match, '', category, type, extra, company, url_tmp);
                }
            }
        }
    });
}
//---------------------------------------------------------------------------------------
async function scrapperCategoriasDoosanbobcat() {
    let name = '';
    let path = '';
    let type = 'categorias';
    let extra = '';
    let company = 'doosanbobcat';
    let url_tmp = '';
    let category = '';
 
    let url = 'https://www.doosanbobcat.cl/';
 
    await axios.get(url).then(urlResponse => {
        const $ = cheerio.load(urlResponse.data);
 
 
        $('a:contains("Venta")').next().find('ul.navigation-dropdown>li.navigation-dropdown-item').each((i, element) => {
 
            url_tmp = $(element).find('a').attr('href').trim();
            //name = $(element).find('a').text().trim().toLowerCase();
            name = url_tmp.split('/');
            name = name[name.length - 1];
            name = name.replace('.html', '');
            //name = removeAccents(name);
            console.log(url_tmp, name);
            //save(conn, name, name, path, category, type, extra, company, 'https://www.finning.com'+url_tmp);
            //scrapperProductosFinning('https://www.finning.com'+url_tmp);
        });
    });
}
//---------------------------------------------------------------------------------------
async function scrapperCategoriasRentsol() {
    let name = '';
    let name2 = '';
    let path = '';
    let type = 'categorias';
    let extra = '';
    let company = 'rentsol';
    let url_tmp = '';
    let url_tmp2 = '';
    let category = 'arriendo';
 
    let url = 'https://www.rentsol.com.co/renta/';
 
    let arr_control_categorias = [];
 
    await axios.get(url).then(urlResponse => {
        const $ = cheerio.load(urlResponse.data);
 
 
        $('li#menu-item-9731>ul>li').each((i, element) => {
 
            url_tmp = $(element).find('a').attr('href').trim();
            $('a[href="' + url_tmp + '"]').next().find('ul>li').each((j, element2) => {
                url_tmp2 = $(element2).find('a').attr('href').trim();
                name2 = url_tmp2.split('/');
                name2 = name2[name2.length - 2];
                name2 = name2.replace('.html', '');
 
                if (arr_control_categorias.includes(url_tmp2) == false) {
                    arr_control_categorias.push(url_tmp2);
                    scrapperProductosRentsol(url_tmp2);
                    save(conn, name2, name2, path, category, type, extra, company, url_tmp2);
                    console.log(url_tmp2, name2);
                }
            });
 
            name = url_tmp.split('/');
            name = name[name.length - 2];
            name = name.replace('.html', '');
 
            if (arr_control_categorias.includes(url_tmp) == false) {
                arr_control_categorias.push(url_tmp);
                scrapperProductosRentsol(url_tmp);
                save(conn, name, name, path, category, type, extra, company, url_tmp);
                console.log(url_tmp, name);
            }
        });
    });
}
//---------------------------------------------------------------------------------------
function scrapperProductosRentsol(url) {
    let name = '';
    let name_match = '';
    let path = '';
    let type = 'productos';
    let extra = '';
    let company = 'rentsol';
    let url_tmp = '';
    let category = 'arriendo';
 
    axios.get(url).then(urlResponse => {
        const $ = cheerio.load(urlResponse.data);
        $('a.woocommerce-loop-product__link').each((i, element) => {
            url_tmp = $(element).attr('href').trim();
 
            url_ = url.split('/');
            url_ = url_[url_.length - 2];
            url_ = url_.replace('.html', '');
 
            name = url_tmp.split('/');
            name = name[name.length - 2];
            name = name.replace('.html', '');
            name = url_ + '-' + name;
            name_match = name;
            path = $(element).find('div>img').attr('data-src');
 
            if (path != undefined && name != undefined) {
                console.log(url_tmp, name);
                save(conn, name, name_match, path, category, type, extra, company, url_tmp);
            }
 
            //console.log(name);
        });
    });
}
//---------------------------------------------------------------------------------------
function scrapperProductosRentsolVenta(url) {
    let name = '';
    let name_match = '';
    let path = '';
    let type = 'productos';
    let extra = '';
    let company = 'rentsol';
    let url_tmp = '';
    let category = 'venta';
 
    axios.get(url).then(urlResponse => {
        const $ = cheerio.load(urlResponse.data);
        $('a.woocommerce-loop-product__link').each((i, element) => {
            url_tmp = $(element).attr('href').trim();
 
            url_ = url.split('/');
            url_ = url_[url_.length - 2];
            url_ = url_.replace('.html', '');
 
            name = url_tmp.split('/');
            name = name[name.length - 2];
            name = name.replace('.html', '');
            name = url_ + '-' + name;
            name_match = name;
            path = $(element).find('div>img').attr('data-src');
 
            if (path != undefined && name != undefined) {
                console.log(url_tmp, name);
                save(conn, name, name_match, path, category, type, extra, company, url_tmp);
            }
 
            //console.log(name);
        });
    });
}
//funcion para guardar datos en pages
function save(con, name, name_match, path, category, type, extra, company, url) {
    name_match = convertToSlug(name_match);
    //TODO: validacion para que no existan duplicados (DONE)
    //para debuguear anteponer "DEBUG:" 
    let sql = 'insert ignore into pages (name, name_match, path_image_original, category, type, extra, company, url ) values ';
    sql += '("' + name + '" , "' + name_match + '", "' + path + '", "' + category + '", "' + type + '", "' + extra + '", "' + company + '", "' + url + '");';
 
    con.query(sql, function (err, result) {
        if (err) throw err;
        // console.log("1 record inserted");
    });
}
//funcion para guardar datos en log
function saveLog(con, event, company) {
    //TODO: validacion para que no existan duplicados (DONE)
    //para debuguear anteponer "DEBUG:" 
    let sql = 'insert into logs (event, company, date ) values ';
    sql += '("' + event + '" , "' + company + '", now());';
 
    con.query(sql, function (err, result) {
        if (err) throw err;
        // console.log("1 record inserted");
    });
}
function convertToSlug(Text) {
    if (Text != null && Text != 'null' && Text != 'NULL' && Text != undefined)
        return Text.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
}
 
const removeAccents = (str) => {
    return str.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");
}
//iniciar script
 
(async _ => {
    saveLog(conn, '[INI FUNCTION scrapperCategoriasFinning]', 'finning')
    console.log(1);
    await scrapperCategoriasFinning();
    console.log(2);
    saveLog(conn, '[END FUNCTION scrapperCategoriasFinning]', 'finning')
    conn.end();
})();
 
/*
scrapperCategoriasRentsol();
for(let i=1; i < 3; i++)
    scrapperProductosRentsolVenta('https://www.rentsol.com.co/product-category/venta/page/'+i+'/');
*/
//scrapperCategoriasDoosanbobcat();
//scrapperProductosRentol('https://www.rentsol.com.co/product-category/maquinaria-pesada/excavadoras-maquinaria-pesada/');
 
 
 
/*
(async _=> {
    await scrapperCategoriasFinning();
    await scrapperCategoriasDoosanbobcat();
})();
*/
 
//scrapperProductosFinning('https://www.finning.com/es_CL/productos/nuevos/equipos/camiones-articulados.html');
//scrapperProductosFinning('https://www.finning.com/es_CL/productos/nuevos/equipos/camiones-de-obras.html');
//scrapperProductosFinning('https://www.finning.com/es_CL/productos/usados/accesorios/varios.html');
//scrapperProductosFinning('https://www.finning.com/es_CL/productos/nuevos/equipos/pavimentadoras-de-asfalto.html');