module.exports = function (){
   let util = {};

   util.parseIssues = function (data) {
       let issues = [];

       if(data.issues) {

           for (let i = 0; i < data.issues.length; i++) {
               issues.push({});
               issues[i].id = data.issues[i].id;
               issues[i].key = data.issues[i].key;
               issues[i].summary = data.issues[i].fields.summary;
               issues[i].description = data.issues[i].fields.description;
               issues[i].created = data.issues[i].fields.created;
               issues[i].priority = data.issues[i].fields.priority.name;
               issues[i].creator = data.issues[i].fields.creator.displayName;
               issues[i].storyPoints = data.issues[i].fields.customfield_10014;
               issues[i].productOwner = data.issues[i].fields.customfield_10026;
               issues[i].issuetype = data.issues[i].fields.issuetype.name;
               issues[i].status = data.issues[i].fields.status.name;
               issues[i].components = [];
               issues[i].fixVersions = [];
               issues[i].attachment = [];

               if (data.issues[i].fields.components) {
                   for (let c = 0; c < data.issues[i].fields.components.length; c++) {
                       issues[i].components.push({
                           id: data.issues[i].fields.components[c].id,
                           name: data.issues[i].fields.components[c].name,
                           projectId: data.issues[i].fields.components[c].projectId
                       });
                   }
               }

               if (data.issues[i].fields.fixVersions) {
                   for (let c = 0; c < data.issues[i].fields.fixVersions.length; c++) {
                       issues[i].fixVersions.push({
                           id: data.issues[i].fields.fixVersions[c].id,
                           name: data.issues[i].fields.fixVersions[c].name,
                           releaseDate: data.issues[i].fields.fixVersions[c].releaseDate,
                           released: data.issues[i].fields.fixVersions[c].released
                       });
                   }
               }

               if (data.issues[i].fields.attachment) {
                   for (let c = 0; c < data.issues[i].fields.attachment.length; c++) {
                       issues[i].attachment.push({
                           filename: data.issues[i].fields.attachment[c].filename,
                           content: data.issues[i].fields.attachment[c].content
                       });
                   }
               }

           }
       }
       return issues;

   };

   return util;
} ;


