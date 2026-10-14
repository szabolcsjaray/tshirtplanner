# TShirt Planner program description

## Technical description

The program is a simple web page (HTML, CSS and JS files).

## Program

Program is used to create an image, which can be downloaded from the page as a PNG file.

### Input

The input is a txt file, which can be uploaded to the webpage via an input field ("Labels").
The txt file has labels, in each row.

### Output

The webpage renders the labels onto an image (canvas), filling the whole canvas with as many rows, as needed. The labels are written in a sequence in the rows. When there is no more label, we start using them from the first again. The labels are rendered on the  canvas (in the actual row) with different colors, picked from a color palette in a arndom order. Consequence labels should be rendered with different colors.
The output image should have a transparent color background.
First label in the row should start at a random position, negative, before the left border of the image, maximu shift is the label's render width. Last label should go out of the image right border.

Apply a gradual transition into full transparency at the edges of the image. At the edge of the image it should be fully transparent, and in the inner border of the edge, the labels should be totally visible.

### Layout

The canvas, containing the output image should have a frame around it.

### Parameters

Parameters should be setable for the user.
Parameters:
- font size of the labels
- gap size between labels
- gap size between rows
- font type of the label
- output image size
- color palette
- gradual transparent edge part size in pixels

#### Color palette

Uer should be able to add color (pick from usual color picker), and remove colr from palette.
Default color palette should be gradual blue palette (from really dark blue to light blue, 16 colors).