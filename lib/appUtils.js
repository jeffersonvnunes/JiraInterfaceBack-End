module.exports = function (){
   let util = {};

   util.parseIssues = function (data) {
       let issues = [];

       for( let i = 0; i < data.issues.length; i++){
           issues.push({});
           issues[i].id = data.issues[i].id;
           issues[i].key = data.issues[i].key;
           issues[i].summary = data.issues[i].fields.summary;
           issues[i].issuetype = data.issues[i].fields.issuetype.name;
           issues[i].status = data.issues[i].fields.status.name;
           issues[i].components = [];

           if (data.issues[i].fields.components) {
               for (let c = 0; c < data.issues[i].fields.components.length; c++) {
                   issues[i].components.push({
                       id: data.issues[i].fields.components[c].id,
                       name: data.issues[i].fields.components[c].name,
                       projectId: data.issues[i].fields.components[c].projectId
                   });
               }
           }

       }

       return issues;

   };

   return util;
} ;


