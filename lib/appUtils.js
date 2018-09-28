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
                issues[i].description = '';
                issues[i].solution_test = '';

                if(data.issues[i].renderedFields){
                    issues[i].description =  data.issues[i].renderedFields.description;
                    issues[i].solution_test = '<p>'+ data.issues[i].renderedFields.customfield_10025 + '</p>';
                    issues[i].sac = data.issues[i].renderedFields.customfield_10029;
                    issues[i].productOwner = data.issues[i].renderedFields.customfield_10026;
                }

                if(data.issues[i].fields.priority){
                    issues[i].priority = {
                        id: data.issues[i].fields.priority.id,
                        name: data.issues[i].fields.priority.name
                    }
                }

                issues[i].created = data.issues[i].fields.created;
                issues[i].creator = data.issues[i].fields.creator ? data.issues[i].fields.creator.displayName : '';
                issues[i].assignee = data.issues[i].fields.assignee ? data.issues[i].fields.assignee.displayName : '';
                issues[i].issuetype = data.issues[i].fields.issuetype ? data.issues[i].fields.issuetype.name : '';
                issues[i].status = data.issues[i].fields.status ? data.issues[i].fields.status.name : '';
                issues[i].storyPoints = data.issues[i].fields.customfield_10014;
                issues[i].assignee = data.issues[i].fields.assignee.displayName;
                issues[i].components = [];
                issues[i].fixVersions = [];
                issues[i].attachment = [];

                function getSprintID(sprint){
                    let resp = '';

                    if(sprint && sprint[0]){
                        let id = sprint[0].match(/(?<=id=)[0-9]*(?=,|])/g);

                        if(id.length > 0){
                            resp = id[0];
                        }
                    }

                    return resp;
                }

                function getSprintName(sprint){
                    let resp = '';

                    if(sprint && sprint[0]){
                        let name = sprint[0].match(/(?<=name=)[a-z\s0-9]*(?=,|])/gi);

                        if (name.length > 0) {
                            resp = name[0];
                        }
                    }

                    return resp;
                }

                const sprint = data.issues[i].fields.customfield_10010;

                if(sprint){
                    issues[i].sprint = {
                        id: getSprintID(sprint),
                        name: getSprintName(sprint),
                    };
                }

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


