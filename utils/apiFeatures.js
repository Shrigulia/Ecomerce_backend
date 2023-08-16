class ApiFeatures {

    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        // this.querstr is the query - keyword's value
        // e.g ?keywork=laptop

        const keyword = this.queryStr.keyword ? {

            $or: [
                {
                    name: {
                        $regex: this.queryStr.keyword,
                        $options: "ix",
                    },
                },
                {
                    category: {
                        $regex: this.queryStr.keyword,
                        $options: "ix",
                    }
                },
                {
                    description: {
                        $regex: this.queryStr.keyword,
                        $options: "ix",
                    }
                }
            ]

        }
            : {};

        // console.log(keyword);

        // this.query is product.find() method
        this.query = this.query.find({ ...keyword })
        return this;
    }

    filter() {

        // copying the querStr object (means - keyword = value and etc..)
        const queryCopy = { ...this.queryStr };

        // console.log(queryCopy);

        // removing field for category filter
        const removeFields = ["keyword", "page", "limit"];

        // if querycopy includes any element of removeField array it will remove it from querycopy
        removeFields.forEach(key => delete queryCopy[key]);

        // console.log(queryCopy);

        // filter for price and rating

        // converting queycopy into string to replace 
        let queryStr = JSON.stringify(queryCopy);

        // it replace gt,gte,lt,lte with $behind them as to find the price inmongo db with operator
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        // converting again to object
        this.query = this.query.find(JSON.parse(queryStr));

        // console.log(queryStr);


        return this;

    }
    pagination(resultPerPage) {

        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1); //e.g = 10 * (1 -1) = 0 , on page 1 it skip 0 products;


        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;



    }
}

export default ApiFeatures;