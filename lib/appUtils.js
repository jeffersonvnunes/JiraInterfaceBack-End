module.exports = function (){
    let util = {};

    util.parseIssues = function (data) {
        let issues = [],
            dataIssue,
            fields,
            issue;

        if(data.issues) {

            for (let i = 0; i < data.issues.length; i++) {
                issues.push({});

                issue = issues[i];
                dataIssue = data.issues[i];

                issue.id = dataIssue.id;
                issue.key = dataIssue.key;
                issue.description = '';
                issue.solution = '';
                issue.testPlan = '';

                fields = dataIssue.renderedFields;

                if(fields){
                    issue.description =  fields.description;
                    issue.solution = '<p>'+ fields.customfield_10025 + '</p>';
                    issue.testPlan = '<p>'+ fields.customfield_10041 + '</p>';
                }

                fields = dataIssue.fields;

                issue.summary = fields.summary;

                if(fields.priority){
                    issue.priority = {
                        id: fields.priority.id,
                        name: fields.priority.name
                    }
                }

                if(fields.customfield_10037){
                    issue.requireHomologation = {
                        id: fields.customfield_10037.id,
                        value: fields.customfield_10037.value
                    }
                }

                if(fields.customfield_10036){
                    issue.productOwner = {
                        id: fields.customfield_10036.id,
                        value: fields.customfield_10036.value
                    }
                }

                issue.created = fields.created;
                issue.creator = fields.creator ? fields.creator.displayName : '';
                issue.assignee = fields.assignee ? fields.assignee.displayName : '';
                issue.issuetype = fields.issuetype ? fields.issuetype.name : '';
                issue.status = fields.status ? fields.status.name : '';
                issue.storyPoints = fields.customfield_10014;
                issue.sac = fields.customfield_10029;
                issue.lastUserUpdate = fields.customfield_10044;
                issue.components = [];
                issue.departments = [];
                issue.fixVersions = [];
                issue.attachment = [];

                function getSprintID(sprint){
                    let resp = '';

                    if(sprint && sprint[0]){
                        let id = sprint[0].match(/(?<=id=)[0-9]*(?=,|])/g);

                        if(id.length > 0){
                            resp = parseInt(id[0]);
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

                function getCanEdit(sprint){
                    let resp = '';

                    if(sprint && sprint[0]){
                        let name = sprint[0].match(/(?<=state=)[a-z]*(?=,|])/gi);

                        if (name.length > 0) {
                            resp = name[0].toUpperCase() === 'FUTURE';
                        }
                    }

                    return resp;
                }

                const sprint = fields.customfield_10010;

                if(sprint){
                    issue.sprint = {
                        id: getSprintID(sprint),
                        name: getSprintName(sprint),
                        canEdit: getCanEdit(sprint),
                    };
                }

                if (fields.components) {
                    for (let c = 0; c < fields.components.length; c++) {
                        issue.components.push({
                            id: fields.components[c].id,
                            name: fields.components[c].name,
                            projectId: fields.components[c].projectId
                        });
                    }
                }

                if (fields.customfield_10040) {
                    for (let c = 0; c < fields.customfield_10040.length; c++) {
                        issue.departments.push({
                            id: fields.customfield_10040[c].id,
                            value: fields.customfield_10040[c].value
                        });
                    }
                }

                if (fields.fixVersions) {
                    for (let c = 0; c < fields.fixVersions.length; c++) {
                        issue.fixVersions.push({
                            id: fields.fixVersions[c].id,
                            name: fields.fixVersions[c].name,
                            releaseDate: fields.fixVersions[c].releaseDate,
                            released: fields.fixVersions[c].released
                        });
                    }
                }

                if (fields.attachment) {
                    for (let c = 0; c < fields.attachment.length; c++) {
                        issue.attachment.push({
                            filename: fields.attachment[c].filename,
                            content: fields.attachment[c].content
                        });
                    }
                }

            }
        }
        return issues;

    };

    return util;
} ;


