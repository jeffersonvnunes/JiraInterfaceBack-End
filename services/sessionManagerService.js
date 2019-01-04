module.exports = (function (){
    let sessionManager = {};

    sessionManager.sessions = [];

    sessionManager.addSession = function (data) {
        let session = {
            token: data.Token,
            userLogin: data.Usuario,
            userName: data.Nome_Usuario,
            loginDate: data.Dh_conexao.replace('Z',''),
            expiryDate: data.Dh_expira.replace('Z',''),
        };
        sessionManager.sessions.push(session);

        return session;
    };

    sessionManager.isAuthenticated = function (req, resp, next) {
        let session = sessionManager.sessions.filter(function(session){
            if(session.token === req.headers.token){
                return session;
            }
        });

        if (req.headers.token && session.length > 0){
            return next();
        }else{
            resp.status(401).send('Não autorizado');
        }
    }

    return sessionManager;
})();