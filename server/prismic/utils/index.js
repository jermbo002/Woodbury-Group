const prismic = require( '@prismicio/client' );
const prismicH = require( '@prismicio/helpers' );

module.exports = class PrismicUtils {
    static routes() {
        return [
            { type: 'home', path: '/' }
        ];
    }

    static linkResolver( doc, ctx ) {
        // if ( doc.type === 'some_type' ) {
        //     return `/path/${doc.uid}`;
        // }

        return '/';
    }

    static cleanFieldValue( value ) {
        if ( !value || value === 'null' ) {
            return '';
        }

        return value;
    }

    static async getSinglePage( { client }, docType ) {
        try {
            const { data } = await client.getSingle( docType );
            return data;
        }
        catch ( e ) {
            throw e;
        }
    }

    static async getByUID( { client }, docType, uid ) {
        try {
            const result = await client.getByUID( docType, uid );

            if ( !result || !result.data ) {
                throw new Error( '404' );
            }

            const data = result.data;
            return data;
        }
        catch ( e ) {
            throw e;
        }
    }

    static async queryByType( { client }, docType, filters = [], options = {} ) {
        try {
            const result = await client.getAllByType( docType, {
                predicates: filters,
                ...options
            } );

            return result;
        }
        catch ( e ) {
            throw e;
        }
    }

    static getRichTextHTML( field ) {
        return prismicH.asHTML( field, PrismicUtils.linkResolver );
    }
};