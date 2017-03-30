function mymatch(regex,str) {
  var nfa = (new re.RegExpNFA(regex)).toNFA();
  var cap = re.search(str, nfa, re.FLAG_CAPTURE_ALL);
  return cap;
}


function ascii(x) { return x.charCodeAt(0); }
function snode(value, next) {
  return { end: false, edge: [{from: value, to: value, next: next}] };
}
function nospacenode(next) {
  return { end: false, edge: [{from: 22, to: 126, next: next}] };
}

function endnode() {
  return { end: true, edge: [] };
}

var STAR = 42;

function starNode(node, next) {
  var thisStarNode = { end: false };
  var starPart = { from: node.edge[0].from, to: node.edge[0].to, next: thisStarNode };
  var contPart = { negation: true, from: node.edge[0].from, to: node.edge[0].to, next: next };
  thisStarNode.edge = [starPart, contPart];
  return thisStarNode;
}

function nodeTree(str) {
  var last=endnode();
  var prev=last;
  for (let i=str.length-1;i>=0;i--) {
    var v = str.charCodeAt(i);
    if (v === STAR) {
      prev=starNode(nospacenode(), prev);
    } else {
      prev = snode(v, prev);
    }
  }
  return prev;
}

/**
* VERRY simple matcher for expressions on the form "WORD:xxx " where the WORD is given and xxx is a sequence of non-blanks.
* To be used with streams so that the match isn't necessarily complete inside each chunk.
*
* Simple because real regex will be added later. Actually, the given behaviour should be good enough for the use in
* the portal weaving.
*
*/
function stringMatch(expr) {
  var mi=0;
  var count=-1;
  function push(ch) {
    count++;
    if (expr[mi] == ch) {
      mi++;
      if (mi >= expr.length) {
        mi=0;
        return count;
      }
    } else {
      mi=0;
    }
    return false;
  };

  return function match(str) {
    var matches=[];
    for (let j=0;j<str.length;j++) {
      var result = push(str[j]);
      if (result) { matches.push(result); }
    }
    return matches;
  };
}
