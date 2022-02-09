const getTranslate = require('../../../API/getTranslateApi');
const nameToiso = require('../../../API/nameToISO6391language');
const l1cash = require('../../../models/level1cash');
const translationDataBase = require('../../../models/translationDataBase');

module.exports.translate = async(req,res) => {
    const text = req.query.text;
    const sourse = req.query.src.trim();
    const destination = req.query.dest.trim();
    const src = nameToiso(sourse.charAt(0).toUpperCase()+sourse.slice(1));
    const dest = nameToiso(destination.charAt(0).toUpperCase()+destination.slice(1));
    
    let translate;
    
    const cashed = await l1cash.findOne({text:text});
    if(cashed){
        const objId = cashed.storedAt;
        console.log(objId);
        const translatedObj = await translationDataBase.findById(objId);
        console.log(translatedObj.translations.get('en'));
        let tempAns = await translatedObj.translations.get(dest);
        console.log(tempAns);
        if(!tempAns){
            translate = await getTranslate(text,src,dest);
            translate = translate.data.translations[0].translatedText;
            await translatedObj.translations.set(dest,translate);
            await translatedObj.save();
            await l1cash.create({
                text:translate,
                storedAt:translatedObj._id
            });
        }else{
            console.log('cashed used');
            translate = tempAns;
        }
        console.log(text, src, dest);
        res.send({message: translate});
    }else{
        if( src != 'en'){
            let englishTranslation = await getTranslate(text,src, 'en');
            englishTranslation=englishTranslation.data.translations[0].translatedText;
            const ifObjectPresent = await translationDataBase.findOne({englishText:englishTranslation});
            translate = await getTranslate(text,src,dest);
            translate = translate.data.translations[0].translatedText;
            if(!ifObjectPresent){
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
            }else{
                await ifObjectPresent.translations.set(dest,translate);
                await ifObjectPresent.save();
                await l1cash.create({
                    text:translate,
                    storedAt:ifObjectPresent._id
                });
            }
        }else{
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
        res.send({message: translate});
    }
    // res.send({message: translate.data.translations[0].translatedText});
    // res.send({message:text+src+dest})
}