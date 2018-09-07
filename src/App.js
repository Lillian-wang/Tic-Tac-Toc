import React from 'react';
import './App.css';

class Board extends React.Component {
  constructor(props) {
    super(props);
    // Init two dimentional array to represent the child grids
    let i = 0;
    let j = 0;
    const diArrayOfState = [];
    while (j < 10) {
      diArrayOfState[j] = [];
      while (i < 10) {
        i++;
        diArrayOfState[j].push({ self: null, left: null, right: null, top: null, bottom: null, leftTop: null, rightBottom: null, rightTop: null, leftBottom: null })
      }
      i = 0;
      j++;
    }
    const originDiArray = JSON.parse(JSON.stringify(diArrayOfState));
    // Dashboard state consists of player state,child state and winner
    this.state = { player1: null, player2: null, childStates: diArrayOfState, wins: null };
    this.handleClick = this.handleClick.bind(this);
    this.cleanTheState = this.cleanTheState.bind(this);
    this.originDiArray = originDiArray;
  }
  // Change the mark and update child state when click the grid
  handleClick(rowIndex, colIndex) {
    if (this.state.wins) { return }
    let mark = null;
    const childStates = this.state.childStates;
    if (childStates[rowIndex][colIndex].self) { return };
    if (!this.state.player1 && !this.state.player2) {
      this.setState({ player1: true });
      mark = 'O';
    } else if (!this.state.player1 && this.state.player2) {
      this.setState({ player1: true, player2: false })
      mark = 'O';
    } else {
      this.setState({ player1: false, player2: true })
      mark = 'X';
    }
    this.updateChildState(rowIndex, colIndex, mark)
  }

  updateChildState(rowIndex, colIndex, mark) {
    const childStates = this.state.childStates;
    childStates[rowIndex][colIndex].self = mark;
    // Update the relationship of the neighbourhood grids
    if (rowIndex - 1 >= 0) {
      childStates[rowIndex - 1][colIndex].bottom = mark;
      if (colIndex - 1 >= 0) {
        childStates[rowIndex - 1][colIndex - 1].rightBottom = mark;
      }
      if (colIndex + 1 < 10) {
        childStates[rowIndex - 1][colIndex + 1].leftBottom = mark;
      }
    }
    if (rowIndex + 1 < 10) {
      childStates[rowIndex + 1][colIndex].top = mark;
      if (colIndex - 1 >= 0) {
        childStates[rowIndex + 1][colIndex - 1].rightTop = mark;
      }
      if (colIndex + 1 < 10) {
        childStates[rowIndex + 1][colIndex + 1].leftTop = mark;
      }
    }
    if (colIndex - 1 >= 0) {
      childStates[rowIndex][colIndex - 1].right = mark;
    }
    if (colIndex + 1 < 10) {
      childStates[rowIndex][colIndex + 1].left = mark;
    }
    this.setState(childStates);
    // Check if one of the player wins
    const winOrNot = this.checkWinner(rowIndex, colIndex, this.state.childStates[rowIndex][colIndex].self);
    if (winOrNot) {
      this.setState({ wins: true })
    }
  }

  checkWinner(rowIndex, colIndex, mark) {
    return this.checkByRow(rowIndex, colIndex, mark, new Set([])) || this.checkByCol(rowIndex, colIndex, mark, new Set([]))
      || this.checkByLeftSlope(rowIndex, colIndex, mark, new Set([])) || this.checkByrightSlope(rowIndex, colIndex, mark, new Set([]))
  }

  /** check if the row adds up */
  checkByRow(rowIndex, colIndex, mark, set) {
    let leftResult;
    let rightResult;
    if (set.size === 5) {
      return true;
    }
    if (set.has(`${rowIndex}${colIndex}`) || !this.state.childStates[rowIndex][colIndex]) { return }
    if (this.state.childStates[rowIndex][colIndex].left && this.state.childStates[rowIndex][colIndex - 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      leftResult = this.checkByRow(rowIndex, colIndex - 1, mark, set);
    }

    if (this.state.childStates[rowIndex][colIndex].right && this.state.childStates[rowIndex][colIndex + 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      rightResult = this.checkByRow(rowIndex, colIndex + 1, mark, set);
    }
    return leftResult || rightResult;
  }
  /** check if the colmuns adds up */
  checkByCol(rowIndex, colIndex, mark, set) {
    let topResult;
    let bottomResult;
    if (set.size === 5) {
      return true;
    }
    if (set.has(`${rowIndex}${colIndex}`) || !this.state.childStates[rowIndex][colIndex]) {
      return
    }
    if (this.state.childStates[rowIndex][colIndex].top && this.state.childStates[rowIndex - 1][colIndex].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      topResult = this.checkByCol(rowIndex - 1, colIndex, mark, set);
    }
    if (this.state.childStates[rowIndex][colIndex].bottom && this.state.childStates[rowIndex + 1][colIndex].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      bottomResult = this.checkByCol(rowIndex + 1, colIndex, mark, set);
    }
    return topResult || bottomResult;
  }
  /** check if the leftSlope adds up */
  checkByLeftSlope(rowIndex, colIndex, mark, set) {
    let leftBottomResult;
    let rightTopResult;
    if (set.size === 5) {
      return true;
    }
    if (set.has(`${rowIndex}${colIndex}`) || !this.state.childStates[rowIndex][colIndex]) {
      return
    }
    if (this.state.childStates[rowIndex][colIndex].leftBottom && this.state.childStates[rowIndex + 1][colIndex - 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      leftBottomResult = this.checkByLeftSlope(rowIndex + 1, colIndex - 1, mark, set);
    }
    if (this.state.childStates[rowIndex][colIndex].rightTop && this.state.childStates[rowIndex - 1][colIndex + 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      rightTopResult = this.checkByLeftSlope(rowIndex - 1, colIndex + 1, mark, set);
    }
    return leftBottomResult || rightTopResult;
  }

  /** check if the rightSlope adds up */
  checkByrightSlope(rowIndex, colIndex, mark, set) {
    let leftTopResult;
    let rightBottomResult;
    if (set.size === 5) {
      return true;
    }
    if (set.has(`${rowIndex}${colIndex}`) || !this.state.childStates[rowIndex][colIndex]) { return }
    if (this.state.childStates[rowIndex][colIndex].leftTop && this.state.childStates[rowIndex - 1][colIndex - 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      leftTopResult = this.checkByrightSlope(rowIndex - 1, colIndex - 1, mark, set);
    }

    if (this.state.childStates[rowIndex][colIndex].rightBottom && this.state.childStates[rowIndex + 1][colIndex + 1].self === mark) {
      set.add(`${rowIndex}${colIndex}`);
      rightBottomResult = this.checkByrightSlope(rowIndex + 1, colIndex + 1, mark, set);
    }
    return leftTopResult || rightBottomResult;
  }

  cleanTheState() {
    const newDiArrayCopy = JSON.parse(JSON.stringify(this.originDiArray));
    this.setState({ player1: null, player2: null, childStates: newDiArrayCopy, wins: null })
  }

  render() {
    return (
      <div className="App">
        <h1>Tic Tac Toe</h1>
        <p><span>Player 1: O; Player 2: X</span></p>
        {!this.state.wins && <p>Now {this.state.player1 ? 'Player 2' : 'Player 1'} turn</p>}
        <button className="clean-btn" onClick={this.cleanTheState}>Clean up</button>
        {this.state.wins &&
          <p>{this.state.player1 ? 'Player 1' : 'Player 2'} is the winner!</p>
        }
        {Array.from(Array(10)).map((item, i) =>
          <div key={i}>
            {Array.from(Array(10)).map((item, j) =>
              <Grid key={j} parentStatus={this.state} rowIndex={i} colIndex={j} onClickFromBoard={this.handleClick} />
            )}
          </div>
        )}
      </div>
    );
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.props.onClickFromBoard(this.props.rowIndex, this.props.colIndex);
  }
  render() {
    return (
      <div className="grid" onClick={this.onClick}>
        {this.props.parentStatus.childStates[this.props.rowIndex][this.props.colIndex].self}
      </div>
    )
  }
}

export default Board;