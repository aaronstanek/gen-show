# gen-show

This is a JavaScript program which can draw family trees.
The user specifies information about individuals and relationships between individuals and the program does the rest.

Some examples of the program's output:

Example 1:
- [Webpage](https://gen-show.github.io/example1.html) (might take a few seconds to load)
- [PDF](https://gen-show.github.io/example1.pdf)

Example 2:
- [Webpage](https://gen-show.github.io/example2.html) (might take a few seconds to load)
- [PDF](https://gen-show.github.io/example2.pdf)

## Ready to make your own?

You can easily make your own family trees.
There is a template available [here](https://gen-show.github.io/template.zip)
and instructions below!

## How to use

In the HTML file, there are 2 JavaScript variables defined.
`BIODATA` contains biographical information about the people in the tree.
`KIDSDATA` contains information about marriages, and parent-child relationships.

Each sub-array of `BIODATA` is a generation, each generation is sub-divided into individuals:

```
BIODATA = [
    [
        gen0_person0,
        gen0_person1,
        gen0_person2,
        ...
    ],
    [
        gen1_person0,
        ...
    ],
    [
        gen2_person0,
        ...
    ],
    ...
]
```

The order in which people are listed in `BIODATA` is the order in which
they will appear on the tree. (`gen0_person1` will appear to the left of `gen0_person2`
and `gen1_person0` will appear higher on the page than `gen2_person0`)

Each individual is a JavaScript object. The object must have the key `id`.
And each person's `id` must be unique.

These objects may also optionally contain the keys:

`name`, `nickname`, `photo`, `link`, `born`, `died`, `box`, `color`

The values associated with `name`, `nickaname`, `born`, and `died` should be short strings of text.
The values associated with `photo` should be a valid URL, pointing to an image file.
The values associated with `link` should be a valid URL. (The displayed name and photo will become hyperlinks to this address)
The values associated with box should either be `"m"` or `"f"`, indicating whether the person should have
a sharp cornered box, traditionally used for men, or a rounded box, traditionally used for women.
The values associated with `color` should be valid CSS colors; this will be the color of the box.

A basic example:

```
{
    id: "gsmith",
    name: "Grandma Smith",
    box: "f"
}
```

A more advanced example:

```
{
    id: "shake",
    name: "William Shakespeare",
    nickname: "Bard of Avon",
    born: "1564, Stratford-upon-Avon, Warwickshire, England",
    died: "1616, Stratford-upon-Avon, Warwickshire, England",
    photo: "WilliamShakespearePhoto.jpg",
    link: "https://en.wikipedia.org/wiki/William_Shakespeare",
    box: "m",
    color: "red"
}
```

Each sub-array of `KIDSDATA` represents a relationship between people.
The elements of each sub-array indicate who is involved in this relationship and how.
The first element of each sub-array lists the `ids` of the parents/spouses in the relationship.
The second element of each sub-array lists the `ids` of the children.
The third element is optional, and cna be used to control the display of the relationship.

Example:

```
[
    ["mom","dad"],
    ["bobby","mary","joe"]
]
```

This can also be used to indicate marriage without children:

```
[
    ["tom","gary"],
    []
]
```

The display options are `"t"`, and `"d"`.
They are concentanted and placed as the third element in the relationship.

Examples from before:

```
[
    ["mom","dad"],
    ["bobby","mary","joe"],
    "td"
]
```

```
[
    ["tom","gary"],
    [],
    "t"
]
```

Normally, people are connected through downward lines.
The `"t"` option will connect parents/spouses through a horizontal line,
which will then travel downward to their children, if any.
The `"d"` option will replace the solid line with a dashed line.

For a more practical usage example, please see gen-show.html.

## License

You can use this software for whatever you want, including things which may earn you money.
You can edit it and distribute it.
Attribution would be nice, but isn't required.

## Contact me

If you found a bug, have a feature request, or just found this program useful,
be sure to let me know.
