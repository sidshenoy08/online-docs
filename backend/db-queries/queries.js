async function fetchDocuments(userId, db) {
    try {
        const docs = await db.orm.public.Document
            .where({ userId: userId })
            .select("id", "name", "createdAt", "updatedAt")
            .all();
        
        console.log(`Documents for user ${userId} fetched!`); // successfuly retrieved all documents
        return docs;
    } catch (err) {
        console.log(`Error ${err} occurred while fetching documents!`);
        throw err;
    }
}


async function fetchDocumentContent(userId, docId, db) {
    try {
        const doc = await db.orm.public.Document
            .where({userId: userId})
            .where({id: docId})
            .select("id", "name", "content")
            .first(); // find document by id and userid

        if (doc) {
            console.log(`Content ${docId} of document ${docId} retrieved successfully!`); // successfuly retrieved content of given document
        } else {
            console.log(`Document ${docId} not found!`);
        }
        
        return doc;
    } catch (err) {
        console.log(`Error ${err} occurred while fetching document ${docId}!`);
        throw err;
    }
}


async function updateDocument(userId, docId, docTitle, docContent, db) {
    try {
        const doc = await db.orm.public.Document
            .where({ userId: userId })
            .where({ id: docId })
            .update({ name: docTitle, content: docContent });

        console.log(`Doc '${docTitle}' of user ${userId} updated!`); // updated existing document
        return doc;
    } catch (err) {
        console.log(`Error ${err} occurred while updating document!`);
        throw err;
    }
}


async function saveDocument(userId, docTitle, docContent, db) {
    try {
        const doc = await db.orm.public.Document.create({
            name: docTitle,
            userId: userId,
            content: docContent
        });

        if (doc) {
            console.log(`Document ${docId} of user ${userId} updated successfully!`);
        } else {
            console.log(`Document ${docId} not found!`);
        }

        return doc;
    } catch (err) {
        console.log(`Error ${err} occurred while saving document!`);
        throw err;
    }
}


async function deleteDocument(userId, docId, db) {
    try {
        const doc = await db.orm.public.Document
            .where({ userId: userId })
            .where({ id: docId })
            .delete(); // find document by id and userid

        if (doc) {
            console.log(`Document ${docId} of user ${userId} deleted successfully!`);
        } else {
            console.log(`Document ${docId} not found!`);
        }

        return doc;
    } catch (err) {
        console.log(`Error ${err} occurred while deleting document ${docId}!`);
        throw err;
    }
}


module.exports = { fetchDocuments, fetchDocumentContent, updateDocument, saveDocument, deleteDocument };