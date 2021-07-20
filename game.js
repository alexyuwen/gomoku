const play_area_length = 600;

const player = "O";
const computer = "X";
const side_length = 12;
const num_squares = Math.pow(side_length, 2);
const required_streak = 5;

let is_board_full = false;
let all_plays = new Array(num_squares).fill("");
let last_player_move = -1;

// Currently focusing on Threat Level 1 patterns
const horizontal_patterns = [
  ["", "O", "O", "O", ""]
];

const board = document.querySelector(".play-area");

const winner = document.getElementById("winner");


const equal_arrays = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};


// Returns suggested move
const check_horizontal = (i, streak_req) => {
  const left_border = side_length * Math.floor(i / side_length);
  for (j = Math.max(left_border, i - streak_req + 1); j < i; j++) {
    let temp = all_plays.slice(j, j + streak_req);
    for (p of horizontal_patterns) {
      if (equal_arrays(p, temp)) {
        return j;
      }
    }
  }
  return null;

  // for (i = Math.max(left_border, i - streak_req + 1); i < Math.min(right_border, i + streak_req - 1); i++) {
  //   if (all_plays[i] == player) {
  //     cont_streak++;
  //   }
  //   else {
  //     cont_streak = 1
  //   }
  //   if (cont_streak == streak_req) {
  //     return [i - streak_req + 1 , i];
  //   }
  // }
};



check_board_complete = () => {
  is_board_full = true;
  all_plays.forEach(element => {
    if (element != player && element != computer) {
      is_board_full = false;
    }
  });
};


// Check that all squares in line are equal and non-empty
const check_line = (...squares) => {
  return squares.every((square) => all_plays[square] == all_plays[squares[0]]) && 
  (all_plays[squares[0]] == player || all_plays[squares[0]] == computer);
};

const check_match = () => {
  // Check horizontals
  for (i = 0; i < num_squares; i += side_length) {
    for (j = 0; j <= side_length - required_streak; j++) {
      // Create candidate streak
      let candidate = [];
      for (k = 0; k < required_streak; k++) {
        candidate.push(i + j + k);
      }
      // Check candidate streak
      if (check_line(...candidate)) {
        for (k = 0; k < required_streak; k++) {
          document.querySelector(`#block_${i+j+k}`).classList.add("win");
        }
        return all_plays[i + j];
      }
    }
  }

  // Check verticals
  for (i = 0; i < side_length; i++) {
    for (j = 0; j <= (side_length - required_streak) * side_length; j += side_length) {
      // Create candidate streak
      let candidate = [];
      for (k = 0; k < required_streak * side_length; k += side_length) {
        candidate.push(i + j + k);
      }
      // Check candidate streak
      if (check_line(...candidate)) {
        for (k = 0; k < required_streak * side_length; k += side_length) {
          document.querySelector(`#block_${i+j+k}`).classList.add("win");
        }
        return all_plays[i + j];
      }
    }
  }

  // Check downward diagonals (left to right)
  for (i = 0; i <= side_length - required_streak; i++) {
    for (j = 0; j <= side_length - required_streak; j++) {
      // Create candidate streak
      let candidate = [];
      for (k = 0; k < required_streak; k++) {
        let square = i + j*side_length + k*(side_length + 1);
        candidate.push(square);
      }
      // Check candidate streak
      if (check_line(...candidate)) {
        for (k = 0; k < required_streak; k++) {
          let square = i + j*side_length + k*(side_length + 1);
          document.querySelector(`#block_${square}`).classList.add("win");
        }
        return all_plays[i + j*side_length];
      }
    }
  }

  // Check downward diagonals (left to right)
  for (i = 0; i <= side_length - required_streak; i++) {
    for (j = side_length - 1; j >= required_streak - 1; j--) {
      // Create candidate streak
      let candidate = [];
      for (k = 0; k < required_streak; k++) {
        let square = i + j*side_length - k*(side_length - 1);
        candidate.push(square);
      }
      // Check candidate streak
      if (check_line(...candidate)) {
        for (k = 0; k < required_streak; k++) {
          let square = i + j*side_length - k*(side_length - 1);
          document.querySelector(`#block_${square}`).classList.add("win");
        }
        return all_plays[i + j*side_length];
      }
    }
  }
  return "";
};

const check_for_winner = () => {
  let res = check_match()
  if (res == player) {
    winner.innerText = "You won!";
    winner.classList.add("playerWin");
    is_board_full = true
  } else if (res == computer) {
    winner.innerText = "You lost.";
    winner.classList.add("computerWin");
    is_board_full = true
  } else if (is_board_full) {
    winner.innerText = "Draw.";
    winner.classList.add("draw");
  }
};

const adjust_border = (i) => {
  if (i < side_length) {
    document.querySelector(`#block_${i}`).style.borderTopWidth = "0px"
  }
  if (i % side_length == 0) {
    document.querySelector(`#block_${i}`).style.borderLeftWidth = "0px"
  }
  if (num_squares - i <= side_length) {
    document.querySelector(`#block_${i}`).style.borderBottomWidth = "0px"
  }
  if ((i + 1) % side_length == 0) {
    document.querySelector(`#block_${i}`).style.borderRightWidth = "0px"
  }
};

const create_grid = () => {
  Array.from(document.getElementsByClassName("block")).forEach(block => {
    block.style.width = `${play_area_length / side_length}px`;
    block.style.height = `${play_area_length / side_length}px`;
  });
};

const render_board = () => {
  board.innerHTML = ""
  board.style["gridTemplateColumns"] = "auto ".repeat(side_length).slice(0, -1);
  all_plays.forEach((e, i) => {
    board.innerHTML += `<div id="block_${i}" class="block" onclick="addPlayerMove(${i})">${all_plays[i]}</div>`;  // template literal

    // Remove borders of outermost squares to create classic TTT look
    adjust_border(i);
    // Create grid
    create_grid();

    if (e == player || e == computer) {
      document.querySelector(`#block_${i}`).classList.add("occupied");
    }
  });
};

const addPlayerMove = i => {
  if (!is_board_full && all_plays[i] == "") {
    all_plays[i] = player;
    last_player_move = i;
    game_loop();
    addComputerMove();
  }
};

const addComputerMove = () => {
  if (!is_board_full) {
    let horizontal = check_horizontal(last_player_move, required_streak);
    if (horizontal !== null) {
      selected = horizontal;
    }
    else {
      do {
        selected = Math.floor(Math.random() * num_squares);
      } 
      while (all_plays[selected] != "");
    }

    all_plays[selected] = computer;
    game_loop();
  }
};

const reset_board = () => {
  all_plays = new Array(num_squares).fill("");
  is_board_full = false;
  winner.classList.remove("playerWin");
  winner.classList.remove("computerWin");
  winner.classList.remove("draw");
  winner.innerText = "";
  render_board();
};

const game_loop = () => {
  render_board();
  check_board_complete();
  check_for_winner();
};


// Initial render
render_board();