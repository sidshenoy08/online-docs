async function fetchDocuments(userId, db) {
    try {
        const docs = await db.orm.public.Document.where({ userId: userId }).select("id", "name", "createdAt", "updatedAt").all();
        console.log(`Documents for user ${userId} fetched!`); // successfuly retrieved all documents
        return docs;
    } catch (err) {
        console.log(`Error ${err} occurred while fetching documents!`);
        throw err;
    }
}


async function saveDocument(userId, docId, docTitle, docContent, db) {
    try {
        if (!docId) {
            const doc = await db.orm.public.Document.create({
                name: docTitle,
                userId: userId,
                content: docContent
            });

            console.log(`New doc '${docTitle}' for user ${userId} created!`); // successfuly saved new document
            return doc;
        } else {
            const doc = await db.orm.public.Document
                .where({ id: docId })
                .update({ name: docTitle, content: docContent });

            console.log(`Doc '${docTitle}' of user ${userId} updated!`); // updated existing document
            return doc;
        }
    } catch (err) {
        console.log(`Error ${err} occurred while saving document!`);
        throw err;
    }
}

module.exports = { fetchDocuments, saveDocument };