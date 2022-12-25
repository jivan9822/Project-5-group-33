class APIFeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // EXCLUDING FIELDS FROM FILTER
    let queryObj = { ...this.queryStr };
    ['sort', 'page', 'limit', 'fields'].map((el) => {
      delete queryObj[el];
    });

    // ADVANCE FILTER FOR COMPARISON
    queryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(lt)|(lte)|(gt)|(gte)\b/g,
        (match) => `$${match}`
      )
    );

    // FOR FIND BY ANY STRING
    ['title', 'description', 'brand', 'style'].map((el) => {
      if (queryObj[el]) {
        queryObj[el] = new RegExp('^' + queryObj[el].toLowerCase(), 'i');
      }
    });
    this.query = this.query.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      this.query = this.query.sort(this.queryStr.sort);
    }
    return this;
  }
  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }
  pagination() {
    if (this.queryStr.page) {
      const page = this.queryStr.page * 1 || 1;
      const limit = this.queryStr.limit * 1 || 3;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

module.exports = APIFeature;
