module.exports = app => {
    app.get( '/error/', ( req, res, next ) => {
        req.pageContent = {
            page_title: 'An Error has Occurred'
        };

        next();
    } );

    app.get( '/404/', ( req, res, next ) => {
        req.pageContent = {
            page_title: 'Page Not Found'
        };

        next();
    } );
};