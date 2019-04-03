module.exports = (function (){
    let sessionManager = {};

    sessionManager.sessions = [];

    sessionManager.addSession = function (data) {
        let session = {
            token: data.Token,
            userLogin: data.Usuario,
            userName: data.Nome_Usuario,
            loginDate: new Date(data.Dh_conexao.replace('Z','')),
            expiryDate: new Date(data.Dh_expira.replace('Z','')),
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
            session[0].expiryDate = new Date(new Date().getTime() + 60*60000).toISOString();
            req.userSession = session[0];
            return next();
        }else{
            resp.status(401).send('Não autorizado');
        }
    };

    sessionManager.removeSession = function (data) {
        sessionManager.sessions = sessionManager.sessions.filter(function(session){
            if(session.token !== data.token){
                return session;
            }
        });
    };

    function clearExpiredSessions (){
        let now = new Date().getTime();

        sessionManager.sessions = sessionManager.sessions.filter(function (session) {
            let exp = new Date(session.expiryDate);
            if (exp.getTime() >= now) {
                return session;
            }
        });
    }

    setInterval(clearExpiredSessions, 5*60000);

    return sessionManager;
})();