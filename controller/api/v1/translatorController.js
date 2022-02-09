const getTranslate = require('../../../API/getTranslateApi');
const nameToiso = require('../../../API/nameToISO6391language');
const l1cash = require('../../../models/level1cash');
const translationDataBase = require('../../../models/translationDataBase');

module.exports.translate = async(req,res) => {  //controller to api translate
    const text = req.body.text.toLowerCase();
    const sourse = req.query.src.trim();
    const destination = req.query.dest.trim();
    const src = nameToiso(sourse.charAt(0).toUpperCase()+sourse.slice(1)); // convert src to capatilize format
    const dest = nameToiso(destination.charAt(0).toUpperCase()+destination.slice(1)); //convert dest to capatilize format
    
    let translate; // veriable to store translated text
    
    const cashed = await l1cash.findOne({text:text});  // find if input text alredy exists in l1 cash
    if(cashed){ // if found in cash
        const objId = cashed.storedAt;
        const translatedObj = await translationDataBase.findById(objId); // find out the object_id in which all translated format is stored
        let tempAns = await translatedObj.translations.get(dest);  // find if the target translation alredy exists in map
        // console.log(tempAns);
        if(!tempAns){ // if translation does not exist
            translate = await getTranslate(text,src,dest); // call translate function which calls external api
            translate = translate.data.translations[0].translatedText;
            await translatedObj.translations.set(dest,translate); // save in the object which stores all translation
            await translatedObj.save();
            await l1cash.create({ // create l1 cash for the translated text
                text:translate,
                storedAt:translatedObj._id
            });
        }else{ // if translation exists
            console.log('cashed used');
            translate = tempAns; //set translate veriable to target
        }
        console.log(text, src, dest);
        return res.status(200).json({original:text,translated: translate}); // return json response
    }else{ // if cash does not exist
        if( src != 'en'){ // check if src is english text and it is not english
            let englishTranslation = await getTranslate(text,src, 'en'); // call external api to get english translation
            englishTranslation=englishTranslation.data.translations[0].translatedText.toLowerCase();
            const ifObjectPresent = await translationDataBase.findOne({englishText:englishTranslation});// check if english translation as key exist in database
            translate = await getTranslate(text,src,dest);
            translate = translate.data.translations[0].translatedText; // translate src to destination
            if(!ifObjectPresent){ // set english src dest in cash and dataBase
                const translationsObject = {
                    'en':englishTranslation,
                }
                translationsObject[src] = text;
                translationsObject[dest] = translate;
                const newItem = await translationDataBase.create({
                    englishText: englishTranslation,
                    translations:translationsObject
                });
                await l1cash.create({
                    text:englishTranslation,
                    storedAt:newItem._id
                });
                await l1cash.create({
                    text:translate,
                    storedAt:newItem._id
                });
                await l1cash.create({
                    text:text,
                    storedAt:newItem._id
                });
            }else{ // else store dest and sorce in cash and dataBase
                await ifObjectPresent.translations.set(dest,translate);
                await ifObjectPresent.translations.set(src,text);
                await ifObjectPresent.save();
                await l1cash.create({
                    text:translate,
                    storedAt:ifObjectPresent._id
                });
                await l1cash.create({
                    text:text,
                    storedAt:ifObjectPresent._id
                })
            }
        }else{ // if src is  english   , Store src and translation in src and destination
            translate = await getTranslate(text,src,dest);
            translate = translate.data.translations[0].translatedText;
            const translationsObject = {
                'en':text,
            }
            translationsObject[dest] = translate;
            const newItem = await translationDataBase.create({
                englishText: text,
                translations:translationsObject
            });
            await l1cash.create({
                text:text,
                storedAt:newItem._id
            });
            await l1cash.create({
                text:translate,
                storedAt:newItem._id
            });
        }
        console.log(text, src, dest);
        return res.status(200).json({original:text,translated: translate});
    }
}