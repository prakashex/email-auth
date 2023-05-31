const { constants } = require("../constants");

const errorHandler = (err , req, res, next) => {
    const statusCode= res.statusCode ? res.statusCode : 500;
    switch (statusCode){
        case constants.VALIDATION_ERROR:
          return res.json({
                title: "Validation Failed",
                message: err.message,
                stackTrace: err.stack
            });
            case constants.UNAUTHORIZED:
              return   res.json({
                    title: "Uauthorized",
                    message: err.message,
                    stackTrace: err.stack
                });
            case constants.FORBIDDEN:
              return   res.json({
                    title: "Forbidden",
                    message: err.message,
                    stackTrace: err.stack
                });
            case constants.NOT_FOUND:
              return res.json({
                    title: "Not found",
                    message: err.message,
                    stackTrace: err.stack
                });
            case constants.SERVER_ERROR:
               return  res.json({
                    title: "Server Error",
                    message: err.message,
                    stackTrace: err.stack
                })                 
            default:
                console.log("no error")
                break;                                                    
    }
   return  res.json({message: err.message, stackTrace: err.stack})
}

module.exports = errorHandler