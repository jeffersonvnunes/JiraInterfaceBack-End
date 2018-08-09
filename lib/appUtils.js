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
               issues[i].storyPoints = data.issues[i].fields.customfield_10014;
               issues[i].productOwner = data.issues[i].fields.customfield_10026;
               issues[i].issuetype = data.issues[i].fields.issuetype.name;
               issues[i].status = data.issues[i].fields.status.name;
               issues[i].components = [];
               issues[i].fixVersions = [];

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

           }
       }
       return issues;

   };

   return util;
} ;


