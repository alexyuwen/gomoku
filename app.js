// import { patterns_by_threat_level } from "./utils.js";

document = window.document;

const play_area_length = 600;

const player = "O";
const computer = "X";
const side_length = 19;
const num_squares = Math.pow(side_length, 2);
const required_streak = 5;

let is_board_full = false;
let all_plays = new Array(num_squares).fill("");
let last_player_move = -1;


const patterns_by_threat_level = {
  1: [
    [["", "O", "O", "O", "O"], [0]],  // closed 4
    [["O", "O", "O", "O", ""], [4]],
    [["", "O", "O", "O", ""], [0, 4]],  // open 3
    [["", "O", "", "O", "O", ""], [2, 5, 0]],  // semiopen 3
    [["", "O", "O", "", "O", ""], [3, 0, 5]],
  ],
  2: [
    [["X", "O", "O", "O", "", ""], [4, 5]],  // closed 3
    [["X", "O", "O", "", "O", ""], [3, 5]],
    [["X", "O", "", "O", "O", ""], [2, 5]],
    [["X", "", "O", "O", "O", ""], [1, 5]],
    [["", "", "O", "O", "O", "X"], [1, 0]],
    [["", "O", "", "O", "O", "X"], [2, 0]],
    [["", "O", "O", "", "O", "X"], [3, 0]],
    [["", "O", "O", "O", "", "X"], [4, 0]],
    [["", "O", "", "O", ""], [2, 0, 4]], // semiopen 2
    [["", "O", "O", "", ""], [3, 0, 4]], // open 2
    [["", "", "O", "O", ""], [1, 4, 0]],
  ],
};


let all_patterns = [];
for (const arr of Object.values(patterns_by_threat_level)) {
  all_patterns.push(...arr);
}

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


const check_horizontal_threats = (i, streak_req, threat_level) => {
  let pattern, possible_plays, temp;
  const left_border = side_length * Math.floor(i / side_length);
  const right_border = left_border + side_length - 1;
  for (j = Math.max(left_border, i - streak_req); j <= Math.min(i, right_border - streak_req + 1); j++) {
    for (arr of patterns_by_threat_level[threat_level]) {
      pattern = arr[0];
      possible_plays = arr[1];
      temp = all_plays.slice(j, j + pattern.length);
      if (equal_arrays(pattern, temp)) {
        return j + possible_plays[0];
      }
    }
  }
  return null;
};


const check_vertical_threats = (i, streak_req, threat_level) => {
  let pattern, possible_plays, temp;
  const top_border = i % side_length;
  const bottom_border = top_border + (side_length - 1) * side_length
  for (j = Math.max(top_border, i - streak_req * side_length); j <= Math.min(i, bottom_border - (streak_req - 1) * side_length); j += side_length) {
    for (arr of patterns_by_threat_level[threat_level]) {
      pattern = arr[0];
      possible_plays = arr[1];
      temp = [];
      for (k = 0; k < pattern.length; k++) {
        temp.push(all_plays[j + k * side_length]);
      }
      if (equal_arrays(pattern, temp)) {
        return j + possible_plays[0] * side_length;
      }
    }
  }
  return null;
};


const check_up_diagonal_threats = (i, streak_req, threat_level) => {
  let pattern, possible_plays, temp;
  let bottom_left_border = i;
  while (bottom_left_border % side_length !== 0 && bottom_left_border < num_squares - side_length) { 
    bottom_left_border += (side_length - 1);
  }
  let upper_right_border = i;
  while (upper_right_border >= side_length && upper_right_border % side_length !== side_length - 1) {
    upper_right_border -= (side_length - 1)
  }
  for (j = Math.min(bottom_left_border, i + streak_req * (side_length - 1)); j >= Math.max(i, upper_right_border + (streak_req - 1) * (side_length - 1)); j -= (side_length - 1)) {
    for (arr of patterns_by_threat_level[threat_level]) {
      pattern = arr[0];
      possible_plays = arr[1];
      temp = [];
      for (k = 0; k < pattern.length; k++) {
        temp.push(all_plays[j - k * (side_length - 1)]);
      }
      if (equal_arrays(pattern, temp)) {
        return j - possible_plays[0] * (side_length - 1);
      }
    }
  }
  return null;
};


const check_down_diagonal_threats = (i, streak_req, threat_level) => {
  let pattern, possible_plays, temp;
  let upper_left_border = i;
  while (upper_left_border % side_length !== 0 && upper_left_border >= side_length) {  // update left_border until we reach the left or top border
    upper_left_border -= (side_length + 1);
  }
  let lower_right_border = i;
  while (lower_right_border < num_squares - side_length && lower_right_border % side_length !== side_length - 1) {
    lower_right_border += (side_length + 1);
  }
  for (j = Math.max(upper_left_border, i - streak_req * (side_length + 1)); j <= Math.min(i, lower_right_border - (streak_req - 1) * (side_length + 1)); j += (side_length + 1)) {
    for (arr of patterns_by_threat_level[threat_level]) {
      pattern = arr[0];
      possible_plays = arr[1];
      temp = [];
      for (k = 0; k < pattern.length; k++) {
        temp.push(all_plays[j + k * (side_length + 1)]);
      }
      if (equal_arrays(pattern, temp)) {
        return j + possible_plays[0] * (side_length + 1);
      }
    }
  }
  return null;
};


// Returns suggested move
const check_for_threats = (i, streak_req) => {
  for (threat_level = 1; threat_level <= 2; threat_level++) {
    let next_move = check_horizontal_threats(i, streak_req, threat_level);
    if (next_move === null) {
      next_move = check_vertical_threats(i, streak_req, threat_level);
    }
    if (next_move === null) {
      next_move = check_up_diagonal_threats(i, streak_req, threat_level);
    }
    if (next_move === null) {
      next_move = check_down_diagonal_threats(i, streak_req, threat_level);
    }
    if (next_move !== null) {
      return next_move;
    }
  }
  return null;
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


const addPlayerMove = i => {
  let block_played = document.getElementById(`block_${i}`);
  if (!is_board_full && all_plays[i] == "") {
    all_plays[i] = player;
    last_player_move = i;
    block_played.innerHTML = "O";
    block_played.classList.add("occupied");
    game_loop();
    addComputerMove();
  }
};


const find_neighbors = i => {
  let arr = [];
  let up, low, left, right, up_left, up_right, low_left, low_right;
  up = i - side_length;
  low = i + side_length;
  left = i - 1;
  right = i + 1;
  up_left = up - 1;
  up_right = up + 1;
  low_left = low - 1;
  low_right = low + 1;

  const border_conditions = {
    "up": up >= 0,
    "low": low < num_squares,
    "left": i % side_length !== 0,
    "right": right % side_length !== 0,
  };

  if (border_conditions["up"] && all_plays[up] === "") {
    arr.push(up);
  }
  if (border_conditions["low"] && all_plays[low] == "") {
    arr.push(low);
  }
  if (border_conditions["left"] && all_plays[left] === "") {
    arr.push(left);
  }
  if (border_conditions["right"] && all_plays[right] === "") {
    arr.push(right);
  }
  if (border_conditions["up"] && border_conditions["left"] && all_plays[up_left] === "") {
    arr.push(up_left);
  }
  if (border_conditions["up"] && border_conditions["right"] && all_plays[up_right] == "") {
    arr.push(up_right);
  }
  if (border_conditions["low"] && border_conditions["left"] && all_plays[low_left] === "") {
    arr.push(low_left);
  }
  if (border_conditions["low"] && border_conditions["right"] && all_plays[low_right] === "") {
    arr.push(low_right);
  }

  return arr;
};


const addComputerMove = () => {
  let block_played, selected, neighbors;
  if (!is_board_full) {
    let threat_responses = check_for_threats(last_player_move, required_streak);
    if (threat_responses !== null) {
      console.log("THREAT AVERTED");
      selected = threat_responses;
    }
    else {
      neighbors = find_neighbors(last_player_move)
      if (neighbors.length !== 0) {
        console.log("NEIGHBOR FOUND");
        selected = neighbors[0];
      }
      else {
        do {
          console.log("RANDOM SQUARE CHOSEN");
          selected = Math.floor(Math.random() * num_squares);
        } 
        while (all_plays[selected] != "");
      }
    }

    all_plays[selected] = computer;
    block_played = document.getElementById(`block_${selected}`);
    block_played.innerHTML = "X";
    block_played.classList.add("occupied");
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
  check_board_complete();
  check_for_winner();
};


const create_grid = () => {
  Array.from(document.getElementsByClassName("block")).forEach(block => {
    block.style.width = `${play_area_length / side_length}px`;
    block.style.height = `${play_area_length / side_length}px`;
  });
};


const render_board = () => {
  board.innerHTML = "";
  for (i = 0; i < num_squares; i++) {
    board.innerHTML += `<div id="block_${i}" class="block" onclick="addPlayerMove(${i})"></div>`;  // template literal
    // Remove borders of outermost squares to create classic TTT look
    adjust_border(i);
  }
  create_grid();
};


const modal = document.getElementById("modal_popup");
const rules_button = document.getElementById("rules_button");
const span = document.getElementsByClassName("close")[0];
rules_button.onclick = () => {
  modal.style.display = "block";
}
// Close popup when user clicks on "x"
span.onclick = () => {
  modal.style.display = "none";
}
// Close popup when user clicks anywhere outside popup
window.onclick = event => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


board.style["gridTemplateColumns"] = "auto ".repeat(side_length).slice(0, -1);
render_board();