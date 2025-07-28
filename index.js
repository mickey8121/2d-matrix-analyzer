class Matrix2D {
  #matrix;

  // Array<{ minPositiveNumber: number | null; replacementCount: number }>
  #rowStats = [];

  // { value: number | null, row: number | null, col: number | null }
  #globalMin = { value: null, row: null, col: null };

  rows;
  cols;
  min = -100;
  max = 100;

  constructor({ rows, cols, min, max }) {
    this.#validateParams({ rows, cols, min, max });

    this.rows = rows;
    this.cols = cols;

    this.min = min;
    this.max = max;
  }

  #validateParams({ rows, cols, min, max }) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
      throw new TypeError('rows and cols must be integers.');
    }

    if (rows <= 0 || cols <= 0) {
      throw new RangeError('rows and cols must be greater than 0.');
    }

    if (typeof min === 'number' && typeof max === 'number' && min >= max) {
      throw new RangeError('min must be less than max.');
    }
  }

  #genrator() {
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
  }

  generate() {
    // clear previous data
    if (this.#rowStats.length) {
      this.#rowStats = [];
      this.#globalMin = { value: null, row: null, col: null };
    }

    this.#matrix = new Array(this.rows);

    // single loop for all rows stats
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      const row = new Array(this.cols);

      let minPos = null;
      let replCount = null;

      for (let colIndex = 0; colIndex < this.cols; colIndex++) {
        const cellValue = this.#genrator();

        row[colIndex] = cellValue;

        if (cellValue > 0) {
          if (minPos === null || cellValue < minPos) {
            minPos = cellValue;
          }
        }

        if (cellValue < this.#globalMin.value) {
          this.#globalMin = { value: cellValue, row: rowIndex, col: colIndex };
        }
      }

      this.#matrix[rowIndex] = row;
      this.#rowStats.push({ minPositiveNumber: minPos, replacementCount: Matrix2D.countReplacements(row) });
    }

    return this;
  }

  static countReplacements(row) {
    let count = 0;
    let runSign = null;
    let runLen = 0;

    const checkLine = () => {
      if (runLen >= 3) {
        count += Math.floor(runLen / 3);
      }

      runLen = 0;
    };

    for (let i = 0; i < row.length; i++) {
      const x = row[i];
      const sign = x > 0 ? '+' : x < 0 ? '-' : '0';

      if (sign === runSign && sign !== '0') {
        runLen++;
      } else {
        checkLine();

        if (sign === '+' || sign === '-') {
          runSign = sign;
          runLen = 1;
        } else {
          runSign = null;
        }
      }
    }

    checkLine();

    return count;
  }

  get globalMin() {
    return { ...this.#globalMin };
  }

  getRowStats(i) {
    return { ...this.#rowStats[i] };
  }

  print() {
    const { value, row: minRow, col: minCol } = this.#globalMin;

    const padValue = Math.max(Math.abs(this.min), Math.abs(this.max)).toString().length + 4;

    // used long dash
    const rowSeparator = '–'.repeat(this.cols * padValue + 1);

    console.log(`\nGlobal min: ${value} (row ${minRow + 1}, col ${minCol + 1})\n`);
    console.log('Matrix:');

    console.log(rowSeparator);

    for (let i = 0; i < this.rows; i++) {
      const row = this.#matrix[i];

      let rowStr = '| ';

      for (let j = 0; j < row.length; j++) {
        rowStr += row[j].toString().padStart(j ? padValue : padValue - 3, '   ');
      }

      const { minPositiveNumber, replacementCount } = this.#rowStats[i];

      const mark = (minRow === i ? ' *' : '  ');

      console.log(
        `${rowStr} | ${mark}` +
        `  | min positive = ${typeof minPositiveNumber === 'number' ? minPositiveNumber : 'none'}; replacement count = ${replacementCount || 'none'}`
      );

      console.log(rowSeparator);
    }
  }
}

new Matrix2D({ rows: 10, cols: 10, min: -100, max: 100 }).generate().print()
