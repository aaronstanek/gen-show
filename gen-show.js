OBJECTLOOKUP = {}; // maps ids to boxes
PADLOOKUP = {}; // maps ids to left pads
SPACELOOKUP = []; // lists the spaces under each generation
MINSPACE = {}; // the minimum space of a left pad, used for t option
LONGVERTICAL = []; // a list of the vertical lines which span multiple generations

H_LINES = [];
V_LINES = [];
H_LINES_T = [];
V_LINES_T = [];

function string_cointains(s,c) {
    for (let i = 0; i < s.length; i++) {
        if (s[i] == c) {
            return true;
        }
    }
    return false;
}

function get_width(obj) {
    let w = obj.style.width;
    w = w.slice(0,w.length-2);
    w = Number.parseFloat(w);
    return w;
}

function make_boxes(hold) {
    // makes boxes
    // fills them with information
    // puts them left justified by generation
    for (let row = 0; row < BIODATA.length; row++) {
        let tab = document.createElement("table");
        hold.appendChild(tab);
        let r = document.createElement("tr");
        tab.appendChild(r);
        for (let col = 0; col < BIODATA[row].length; col++) {
            let d = document.createElement("td");
            r.appendChild(d);
            let n = document.createElement("div");
            d.appendChild(n);
            PADLOOKUP[BIODATA[row][col].id] = n;
            d = document.createElement("td");
            r.appendChild(d);
            n = document.createElement("div");
            d.appendChild(n);
            OBJECTLOOKUP[BIODATA[row][col].id] = n;
            if (BIODATA[row][col].box == "f") {
                n.classList.add("genshowfemale");
            }
            else {
                n.classList.add("genshowmale");
            }
            if (BIODATA[row][col].color != undefined) {
                n.style.borderColor = BIODATA[row][col].color;
            }
            if (BIODATA[row][col].photo != undefined) {
                if (BIODATA[row][col].link == undefined) {
                    let data = document.createElement("img");
                    n.appendChild(data);
                    data.src = BIODATA[row][col].photo;
                    data.style.width = "80%";
                }
                else {
                    let data = document.createElement("a");
                    n.appendChild(data);
                    data.href = BIODATA[row][col].link;
                    data.target = "_blank";
                    let data2 = document.createElement("img");
                    data.appendChild(data2);
                    data2.src = BIODATA[row][col].photo;
                    data2.style.width = "80%";
                }
            }
            if (BIODATA[row][col].name != undefined) {
                let data = document.createElement("p");
                n.appendChild(data);
                if (BIODATA[row][col].link == undefined) {
                    data.innerHTML = BIODATA[row][col].name;
                }
                else {
                    let link = document.createElement("a");
                    data.appendChild(link);
                    link.href = BIODATA[row][col].link;
                    link.target = "_blank";
                    link.innerHTML = BIODATA[row][col].name;
                }
            }
            if (BIODATA[row][col].nickname != undefined) {
                let data = document.createElement("i");
                n.appendChild(data);
                data.innerHTML = BIODATA[row][col].nickname;
            }
            if (BIODATA[row][col].born != undefined) {
                let data = document.createElement("p");
                n.appendChild(data);
                data.innerHTML = "b. " + BIODATA[row][col].born;
            }
            if (BIODATA[row][col].died != undefined) {
                let data = document.createElement("p");
                n.appendChild(data);
                data.innerHTML = "d. " + BIODATA[row][col].died;
            }
        }
        tab = document.createElement("div");
        hold.appendChild(tab);
        SPACELOOKUP.push(tab);
    }
}

function set_generation() {
    // figures out the generation for each parent-child relationship
    for (let i = 0; i < KIDSDATA.length; i++) {
        let found = false;
        for (let j = BIODATA.length - 1; j >= 0; j--) {
            if (found) {
                break;
            }
            for (let k = 0; k < BIODATA[j].length; k++) {
                if (found) {
                    break;
                }
                for (let m = 0; m < KIDSDATA[i][0].length; m++) {
                    if (found) {
                        break;
                    }
                    if (BIODATA[j][k].id == KIDSDATA[i][0][m]) {
                        // we found it
                        if (KIDSDATA[i].length < 3) {
                            KIDSDATA[i].push("");
                        }
                        KIDSDATA[i].push([j]);
                        found = true;
                    }
                }
            }
        }
    }
}

function find_long_verticals_helper(id) {
    // finds the generation of a person with
    // a certain id
    for (let i = 0; i < BIODATA.length; i++) {
        for (let j = 0; j < BIODATA[i].length; j++) {
            if (BIODATA[i][j].id == id) {
                return i;
            }
        }
    }
}

function find_long_verticals() {
    // it finds all vertical lines
    // which will cross through multiple generations
    let has_t;
    let y;
    for (let i = 0; i < KIDSDATA.length; i++) {
        has_t = string_cointains(KIDSDATA[i][2],"t");
        for (let j = 0; j < KIDSDATA[i][0].length; j++) {
            y = find_long_verticals_helper(KIDSDATA[i][0][j]);
            if (y == KIDSDATA[i][3][0]) {
                continue;
            }
            // long vertical found
            if (has_t) {
                if (j != 0) {
                    continue;
                }
                LONGVERTICAL.push([KIDSDATA[i][0],y+1,KIDSDATA[i][3][0]]);
            }
            else {
                LONGVERTICAL.push([[[KIDSDATA[i][0][j]]],y+1,KIDSDATA[i][3][0]]);
            }
        }
        for (let j = 0; j < KIDSDATA[i][1].length; j++) {
            y = find_long_verticals_helper(KIDSDATA[i][1][j]);
            if (y == KIDSDATA[i][3][0]+1) {
                continue;
            }
            // long vertical found
            LONGVERTICAL.push([[KIDSDATA[i][1][j]],KIDSDATA[i][3][0]+1,y]);
        }
    }
}

function computeMinspace() {
    // builds MINSPACE table
    // keeps track of minimum gaps between adjacent people
    // used for making t intersections
    for (let i = 0; i < KIDSDATA.length; i++) {
        let has_t = string_cointains(KIDSDATA[i][2],"t")
        if (!has_t) {
            continue;
        }
        let right_name = KIDSDATA[i][0][0];
        for (let j = 0; j < KIDSDATA[i][0].length; j++) {
            if (findMiddle(OBJECTLOOKUP[KIDSDATA[i][0][j]]) > findMiddle(OBJECTLOOKUP[right_name])) {
                right_name = KIDSDATA[i][0][j];
            }
        }
        MINSPACE[right_name] = 80;
    }
    let keys = Object.keys(OBJECTLOOKUP);
    for (let i = 0; i < keys.length; i++) {
        if (!(keys[i] in MINSPACE)) {
            MINSPACE[keys[i]] = 0;
        }
    }
}

function findMiddle(element) {
    var rec = element.getBoundingClientRect();
    return (rec.left + rec.right) / 2.0;
}

function findTop(element) {
    var rec = element.getBoundingClientRect();
    return rec.top;
}

function findCenter(element) {
    var rec = element.getBoundingClientRect();
    return (rec.top + rec.bottom) / 2.0;
}

function align_goodness_vertical_helper(line_middle,middle) {
    let t = Math.abs(line_middle-middle);
    t = 150 - t;
    t = Math.pow(t,3.0);
    return t;
}

function align_goodness(ignore_overlap) {
    // evaluates how good the alignment is
    // smaller outputs are better
    let total = 0.0;
    for (let i = 0; i < KIDSDATA.length; i++) {
        for (let j = 0; j < KIDSDATA[i][0].length; j++) {
            let p = OBJECTLOOKUP[KIDSDATA[i][0][j]];
            p = findMiddle(p);
            for (let k = 0; k < KIDSDATA[i][1].length; k++) {
                let c = OBJECTLOOKUP[KIDSDATA[i][1][k]];
                c = findMiddle(c);
                c = Math.abs(p-c);
                c = Math.pow(c,2.0);
                total += c;
            }
        }
    }
    let keys = Object.keys(PADLOOKUP);
    for (let i = 0; i < keys.length; i++) {
        if (MINSPACE[keys[i]] == 0) {
            continue;
        }
        let obj = PADLOOKUP[keys[i]];
        let w = get_width(obj);
        if (w >= MINSPACE[keys[i]]) {
            continue;
        }
        w = Math.pow(MINSPACE[keys[i]]-w,3.0);
        total += w;
    }
    if (ignore_overlap) {
        return total;
    }
    total /= 1000.0;
    for (let i = 0; i < LONGVERTICAL.length; i++) {
        let line_middle = 0;
        for (let j = 0; j < LONGVERTICAL[i][0].length; j++) {
            line_middle += findMiddle(OBJECTLOOKUP[LONGVERTICAL[i][0][j]]);
        }
        line_middle /= LONGVERTICAL[i][0].length;
        for (let layer = LONGVERTICAL[i][1]; layer <= LONGVERTICAL[i][2]; layer++) {
            for (let j = 0; j < BIODATA[layer].length; j++) {
                let middle = findMiddle(OBJECTLOOKUP[BIODATA[layer][j].id]);
                if (Math.abs(line_middle-middle) < 150) {
                    total += align_goodness_vertical_helper(line_middle,middle);
                }
            }
            for (let j = 0; j < KIDSDATA.length; j++) {
                if (KIDSDATA[j][3][0] != layer) {
                    continue;
                }
                let has_t = string_cointains(KIDSDATA[j][2],"t");
                if (!has_t) {
                    continue;
                }
                let middle = findMiddle(OBJECTLOOKUP[KIDSDATA[j][0][0]]);
                middle += findMiddle(OBJECTLOOKUP[KIDSDATA[j][0][1]]);
                middle /= 2.0;
                if (Math.abs(line_middle-middle) < 150) {
                    total += align_goodness_vertical_helper(line_middle,middle);
                }
            }
            for (let j = 0; j < LONGVERTICAL.length; j++) {
                if (LONGVERTICAL[j][1] > layer) {
                    continue;
                }
                if (LONGVERTICAL[j][2] < layer) {
                    continue;
                }
                let middle = 0;
                for (let k = 0; k < LONGVERTICAL[j][0].length; k++) {
                    middle += findMiddle(OBJECTLOOKUP[LONGVERTICAL[j][0][k]]);
                }
                middle /= LONGVERTICAL[j][0].length;
                if (Math.abs(line_middle-middle) < 150) {
                    total += align_goodness_vertical_helper(line_middle,middle);
                }
            }
        }
    }
    return total;
}

function align(zero,ignore_overlap) {
    // performs a hill-climber algorithim
    // to minimize the output of align_goodness
    let keys = Object.keys(PADLOOKUP);
    if (zero) {
        for (let i = 0; i < keys.length; i++) {
            PADLOOKUP[keys[i]].style.width = "0px";
        }
    }
    let shift = 10.0;
    let old1;
    let old2;
    let obj1;
    let obj2;
    let sh;
    let kept_change;
    let best = align_goodness(ignore_overlap);
    let comp;
    while (shift > 1.0) {
        kept_change = false;
        for (let i = 0; i < keys.length; i++) {
            if (i != 0) {
                obj1 = PADLOOKUP[keys[i-1]];
            }
            obj2 = PADLOOKUP[keys[i]];
            for (let m = -1; m < 2; m += 2) {
                // consider a swap
                if (i != 0) {
                    old1 = get_width(obj1);
                    old2 = get_width(obj2);
                    if (m > 0) {
                        sh = Math.min(shift,old2);
                    }
                    else {
                        sh = Math.min(shift,old1);
                    }
                    obj1.style.width = (old1 + m*sh) + "px";
                    obj2.style.width = (old2 - m*sh) + "px";
                    comp = align_goodness(ignore_overlap);
                    if (comp < best) {
                        best = comp;
                        kept_change = true;
                    }
                    else {
                        obj1.style.width = old1 + "px";
                        obj2.style.width = old2 + "px";
                    }
                }
                // consider a single move
                old2 = get_width(obj2);
                if (m > 0) {
                    sh = shift;
                }
                else {
                    sh = -Math.min(shift,old2);
                }
                obj2.style.width = (old2 + sh) + "px";
                comp = align_goodness(ignore_overlap);
                if (comp < best) {
                    best = comp;
                    kept_change = true;
                }
                else {
                    obj2.style.width = old2 + "px";
                }
            }
        }
        if (kept_change == false) {
            shift /= 2.0;
        }
    }
}

function remove_left_space() {
    // if there is extra whitespace on the left
    // then remove it
    let space = get_width(PADLOOKUP[BIODATA[0][0].id]);
    for (let i = 1; i < BIODATA.length; i++) {
        let s = get_width(PADLOOKUP[BIODATA[i][0].id]);
        space = Math.min(space,s);
    }
    for (let i = 0; i < BIODATA.length; i++) {
        let s = get_width(PADLOOKUP[BIODATA[i][0].id]);
        s -= space;
        PADLOOKUP[BIODATA[i][0].id].style.width = s + "px";
    }
}

function set_bounds() {
    // figures out the x coordinates
    // of where the generational horizontals should go
    let bar_left;
    let bar_right;
    let v;
    let has_t;
    for (let j = 0; j < KIDSDATA.length; j++) {
        has_t = string_cointains(KIDSDATA[j][2],"t");
        if (has_t) {
            bar_left = findMiddle(OBJECTLOOKUP[KIDSDATA[j][0][0]]);
            bar_right = findMiddle(OBJECTLOOKUP[KIDSDATA[j][0][1]]);
            bar_left += bar_right;
            bar_left /= 2.0;
            bar_right = bar_left;
        }
        else {
            for (let k = 0; k < KIDSDATA[j][0].length; k++) {
                v = findMiddle(OBJECTLOOKUP[KIDSDATA[j][0][k]]);
                if (k == 0) {
                    bar_left = v;
                    bar_right = v;
                    continue;
                }
                bar_left = Math.min(bar_left,v);
                bar_right = Math.max(bar_right,v);
            }
        }
        for (let k = 0; k < KIDSDATA[j][1].length; k++) {
            v = findMiddle(OBJECTLOOKUP[KIDSDATA[j][1][k]]);
            bar_left = Math.min(bar_left,v);
            bar_right = Math.max(bar_right,v);
        }
        KIDSDATA[j][3].push(bar_left);
        KIDSDATA[j][3].push(bar_right);
    }
}

function collision(L1,R1,L2,R2) {
    // determines if two lines would overlap
    let RC = R1 - L1;
    let LM = L2 - L1;
    let RM = R2 - L1;
    if (RM <= -10) {
        return false;
    } 
    if (LM >= RC + 10) {
        return false;
    }
    return true;
}

function set_bar_level() {
    // figure out the vertical position of the generational horizontals
    // ensures that lines can cross but never overlap
    for (let i = 0; i < KIDSDATA.length; i++) {
        let level = 0;
        let j = 0;
        while (j < i) {
            if (KIDSDATA[j][3][0] != KIDSDATA[i][3][0]) {
                j++;
                continue;
            }
            if (KIDSDATA[j][3][3] != level) {
                j++;
                continue;
            }
            if (collision(KIDSDATA[j][3][1],KIDSDATA[j][3][2],KIDSDATA[i][3][1],KIDSDATA[i][3][2])) {
                level++;
                j = 0;
            }
            else {
                j++;
            }
        }
        KIDSDATA[i][3].push(level);
    }
}

function set_spacing() {
    // reserves enough space on the page that we can fit
    // all the generational horizintals that we need to
    for (let i = 0; i < SPACELOOKUP.length; i++) {
        let max_level = 0;
        for (let j = 0; j < KIDSDATA.length; j++) {
            if (KIDSDATA[j][3][0] != i) {
                continue;
            }
            max_level = Math.max(max_level,KIDSDATA[j][3][3]);
        }
        SPACELOOKUP[i].style.height = (80 + (40*max_level)) + "px";
    }
}

// function draw_shield_box(hold,x,y) {
//     let length = 6;
//     let s = "<line x1=\"0\" y1=\"1.5\" x2=\""+length+"\" y2=\"1.5\" style=\"stroke:rgb(255,255,255);stroke-width:3\"/>";
//     let q = "<line x1=\""+(length+3)+"\" y1=\"1.5\" x2=\""+(2*length+3)+"\" y2=\"1.5\" style=\"stroke:rgb(255,255,255);stroke-width:3\"/>";
//     s = "<svg height=\"3\" width=\""+(2*length+3)+"\" style=\"position:absolute;left:"+(x-length-2)+"px;top:"+(y-1.5)+"px\">" + s + q + "</svg>"
//     let span = document.createElement("span");
//     span.innerHTML = s;
//     let svg = span.childNodes[0];
//     hold.appendChild(svg);
//     return svg;
// }

function draw_shield_box(hold,x,y) {
    let s = "<rect x=\"0\" y=\"0\" width=\"13\" height=\"5\" style=\"fill:rgb(255,255,255)\"/>";
    s = "<svg height=\"5\" width=\"13\" style=\"z-index:-2;position:absolute;left:"+(x-6.5)+"px;top:"+(y-2.5)+"px\">" + s + "</svg>";
    let span = document.createElement("span");
    span.innerHTML = s;
    let svg = span.childNodes[0];
    hold.appendChild(svg);
    return svg;
}

function check_line_collision(hold,h_line,v_line) {
    let hx2 = h_line[1] - h_line[0];
    let vx = v_line[0] - h_line[0];
    if ((vx > hx2) || (vx < 0)) {
        return;
    }
    let vy1 = v_line[1] - h_line[2];
    let vy2 = v_line[2] - h_line[2];
    if (vy1 * vy2 > 0) {
        return;
    }
    let x = v_line[0];
    let y = h_line[2];
    draw_shield_box(hold,x,y);
}

function draw_horizontal_line(hold,x,y,length,dash) {
    let s = "<line x1=\"0\" y1=\"1.5\" x2=\""+length+"\" y2=\"1.5\" style=\"stroke:rgb(0,0,0);stroke-width:3";
    if (dash) {
        s += ";stroke-dasharray:2";
    }
    s += "\"/>";
    s = "<svg height=\"3\" width=\""+length+"\" style=\"z-index:-3;position:absolute;left:"+x+"px;top:"+(y-1.5)+"px\">" + s + "</svg>";
    let span = document.createElement("span");
    span.innerHTML = s;
    let svg = span.childNodes[0];
    hold.appendChild(svg);
    let h_line = [x,x+length,y];
    H_LINES_T.push(h_line);
    for (let i = 0; i < V_LINES.length; i++) {
        check_line_collision(hold,h_line,V_LINES[i]);
    }
    return svg;
}

function draw_vertical_line(hold,x,y,length,dash) {
    let s = "<line x1=\"1.5\" y1=\"0\" x2=\"1.5\" y2=\""+length+"\" style=\"stroke:rgb(0,0,0);stroke-width:3";
    if (dash) {
        s += ";stroke-dasharray:2";
    }
    s += "\"/>";
    s = "<svg height=\""+length+"\" width=\"3\" style=\"z-index:-1;position:absolute;left:"+(x-1.5)+"px;top:"+y+"px\">" + s + "</svg>";
    let span = document.createElement("span");
    span.innerHTML = s;
    let svg = span.childNodes[0];
    hold.appendChild(svg);
    let v_line = [x,y,y+length];
    V_LINES_T.push(v_line);
    for (let i = 0; i < H_LINES.length; i++) {
        check_line_collision(hold,H_LINES[i],v_line);
    }
    return svg;
}

function draw_lines(hold) {
    // this draws all the lines on the page
    // all of them
    for (let i = 0; i < KIDSDATA.length; i++) {
        let is_dashed = string_cointains(KIDSDATA[i][2],"d");
        let has_t = string_cointains(KIDSDATA[i][2],"t");
        let vertical_offset = findTop(SPACELOOKUP[KIDSDATA[i][3][0]]) + 40 * (KIDSDATA[i][3][3] + 1);
        let len = KIDSDATA[i][3][2] - KIDSDATA[i][3][1] + 3;
        let bar;
        if (KIDSDATA[i][1].length != 0) {
            bar = draw_horizontal_line(hold,KIDSDATA[i][3][1]-1.5,vertical_offset,len,is_dashed);
        }
        let parent_lines = [];
        if (has_t) {
            let middle0 = findMiddle(OBJECTLOOKUP[KIDSDATA[i][0][0]]);
            let middle1 = findMiddle(OBJECTLOOKUP[KIDSDATA[i][0][1]]);
            let middle = (middle0 + middle1) / 2.0;
            parent_lines.push(middle);
            let center = findCenter(OBJECTLOOKUP[KIDSDATA[i][0][0]]);
            draw_horizontal_line(hold,Math.min(middle0,middle1),center,Math.abs(middle1-middle0),is_dashed);
            if (KIDSDATA[i][1].length != 0) {
                draw_vertical_line(hold,middle,center,vertical_offset-center,is_dashed);
            }
        }
        else {
            for (let j = 0; j < KIDSDATA[i][0].length; j++) {
                let top = findCenter(OBJECTLOOKUP[KIDSDATA[i][0][j]]);
                let middle = findMiddle(OBJECTLOOKUP[KIDSDATA[i][0][j]]);
                parent_lines.push(middle);
                draw_vertical_line(hold,middle,top,vertical_offset-top,is_dashed);
            }
        }
        for (let j = 0; j < KIDSDATA[i][1].length; j++) {
            let bottom = findCenter(OBJECTLOOKUP[KIDSDATA[i][1][j]]);
            let middle = findMiddle(OBJECTLOOKUP[KIDSDATA[i][1][j]]);
            for (let k = 0; k < parent_lines.length; k++) {
                if (Math.abs(middle-parent_lines[k]) < 4) {
                    middle = parent_lines[k];
                    if (KIDSDATA[i][1].length == 1) {
                        bar.parentNode.removeChild(bar);
                    }
                }
            }
            draw_vertical_line(hold,middle,vertical_offset,bottom-vertical_offset,is_dashed);
        }
        for (let j = 0; j < H_LINES_T.length; j++) {
            H_LINES.push(H_LINES_T[j]);
        }
        H_LINES_T = [];
        for (let j = 0; j < V_LINES_T.length; j++) {
            V_LINES.push(V_LINES_T[j]);
        }
        V_LINES_T = [];
    }
}

function bad_validate(m) {
    console.log(m);
    alert(m);
    throw 0;
}

function validate() {
    let ids = {};
    // both BIODATA and KIDSDATA have to be defined
    // otherwise we would not be at this point in the program
    if (!Array.isArray(BIODATA)) {
        bad_validate("Input Error: BIODATA must be an array");
    }
    if (BIODATA.length == 0) {
        bad_validate("Input Error: No people specified");
    }
    for (let i = 0; i < BIODATA.length; i++) {
        if (!Array.isArray(BIODATA[i])) {
            bad_validate("Input Error: BIODATA["+i+"] must be an array");
        }
        for (let j = 0; j < BIODATA[i].length; j++) {
            if (typeof(BIODATA[i][j]) != "object") {
                bad_validate("Input Error: BIODATA["+i+"]["+j+"] must be an object");
            }
            if (!("id" in BIODATA[i][j])) {
                bad_validate("Input Error: BIODATA["+i+"]["+j+"] must contain the key \"id\"")
            }
            if (typeof(BIODATA[i][j].id) != "string") {
                bad_validate("Input Error: BIODATA["+i+"]["+j+"].id must be a string")
            }
            if (BIODATA[i][j].id in ids) {
                bad_validate("Input Error: Duplicate id: "+BIODATA[i][j].id);
            }
            ids[BIODATA[i][j].id] = [i,j];
        }
    }
    if (!Array.isArray(KIDSDATA)) {
        bad_validate("Input Error: KIDSDATA must be an array");
    }
    for (let i = 0; i < KIDSDATA.length; i++) {
        if (!Array.isArray(KIDSDATA[i])) {
            bad_validate("Input Error: KIDSDATA["+i+"] must be an array");
        }
        if ((KIDSDATA[i].length < 2) || (KIDSDATA[i].length > 3)) {
            bad_validate("Input Error: KIDSDATA["+i+"] has an invalid length");
        }
        for (let j = 0; j < 2; j++) {
            if (!Array.isArray(KIDSDATA[i][j])) {
                bad_validate("Input Error: KIDSDATA["+i+"]["+j+"] must be an array");
            }
        }
        let has_t = false;
        if (KIDSDATA[i].length == 3) {
            if (typeof(KIDSDATA[i][2]) != "string") {
                bad_validate("Input Error: KIDSDATA["+i+"][2] must be a string");
            }
            has_t = string_cointains(KIDSDATA[i][2],"t");
        }
        if (has_t) {
            if (KIDSDATA[i][0].length != 2) {
                bad_validate("Input Error: KIDSDATA["+i+"] has an invalid number of parents");
            }
        }
        else {
            if (KIDSDATA[i][0].length == 0) {
                bad_validate("Input Error: KIDSDATA["+i+"] has an invalid number of parents");
            }
        }
        let k_id = {};
        let parent_max = 0;
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < KIDSDATA[i][j].length; k++) {
                if (typeof(KIDSDATA[i][j][k]) != "string") {
                    bad_validate("Input Error: KIDSDATA["+i+"]["+j+"]["+k+"] must be a string");
                }
                if (!(KIDSDATA[i][j][k] in ids)) {
                    bad_validate("Input Error: KIDSDATA["+i+"]["+j+"]["+k+"] contains unknown id: "+KIDSDATA[i][j][k]);
                }
                if (KIDSDATA[i][j][k] in k_id) {
                    bad_validate("Input Error: KIDSDATA["+i+"] contains duplicate id: "+KIDSDATA[i][j][k]);
                }
                k_id[KIDSDATA[i][j][k]] = true;
                if (j == 0) {
                    parent_max = Math.max(parent_max,ids[KIDSDATA[i][j][k]][0]);
                }
                else {
                    if (ids[KIDSDATA[i][j][k]][0] <= parent_max) {
                        bad_validate("Input Error: KIDSDATA["+i+"] contains children in an generation older than they should be");
                    }
                }
            }
        }
        if (has_t) {
            let p1 = ids[KIDSDATA[i][0][0]];
            let p2 = ids[KIDSDATA[i][0][1]];
            if (p1[0] != p2[0]) {
                bad_validate("Input Error: KIDSDATA["+i+"] is marked with option \"t\" but parents are not in the same generation");
            }
            if ( Math.abs( p1[1] - p2[1] ) != 1 ) {
                bad_validate("Input Error: KIDSDATA["+i+"] is marked with option \"t\" but parents are not next to each other");
            }
        }
    }
}

function set_print_size_helper(s) {
    let t = s.slice(0,s.length-2);
    t = Number.parseFloat(t);
    return t;
}

function set_print_size(hold) {
    let w = hold.getBoundingClientRect().width;
    let h = hold.getBoundingClientRect().height;
    let s = window.getComputedStyle(hold);
    w += set_print_size_helper(s.marginLeft);
    w += set_print_size_helper(s.marginRight);
    h += set_print_size_helper(s.marginTop);
    h += set_print_size_helper(s.marginBottom);
    s = "size: " + w + "px " + h + "px;";
    s = "@page {" + s + "}";
    s = "@media print {" + s + "}";
    s = "<style>" + s + "</style>";
    let span = document.createElement("span");
    span.innerHTML = s;
    let head = document.getElementsByTagName("head")[0];
    head.appendChild(span.childNodes[0]);
}

function build1(hold) {
    make_boxes(hold);
    set_generation();
    find_long_verticals();
    computeMinspace();
    align(true,true);
    align(false,false);
    remove_left_space();
}

function build2(hold) {
    scroll(0,0);
    set_bounds();
    set_bar_level();
    set_spacing();
    draw_lines(hold);
    set_print_size(hold);
}

function genshow(count) {
    if (count == 2000) {
        alert("gen-show resources could not be loaded");
        return;
    }
    if (document.readyState != "complete") {
        setTimeout(genshow,1,count+1);
        return;
    }
    if ((window.BIODATA == undefined) || (window.KIDSDATA == undefined)) {
        bad_validate("Input Error: Missing either BIODATA or KIDSDATA entirely");
    }
    validate();
    let body = document.getElementsByTagName("body")[0];
    build1(body);
    document.getElementById("loading").style.display = "none";
    // we need to let the browser settle all the elements
    // on the page before we draw the lines
    setTimeout(build2,1,body);
}

genshow();