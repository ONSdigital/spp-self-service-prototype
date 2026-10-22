# rule summary page

get rid of tabs (dont need to be ordered by forms)

one table

should be paginated

rule id, first column (human friendly, 001 as something to start with)

template second column (VDLPGTX etc)

qcode third column

error message

manage link at the end (like we already have but it just has the incorrect data right now)

e.g:

RULE ID TEMPLATE QCODE MESSAGE ACTION

001.    VDLGPTX. Q101. error.  update link

end of journey what u have created should be inserted into this rule summary table (localstorage)

paginated (first 10)

# get rid of select for multiple forms on template page when picking a template


# create page

change add button to checkboxes to allow selecting multiple

save and continue button should be ... (fine for now)

# configure page

when changing the fields for the formula, dont update in realtime- should update when u press the refresh formula button


## rules for formula

no defaults on any dropdowns, user has to select one of the options (show like --select-- or something)

in the formula when it updates, if you enter 70% it should turn into 0.7 or something like that (70% isnt valid inside a maths expression which we are displaying).

formula when it is something like response(qcode here, offset) - offset has to always be present even if 0.

adjustedresponse(qcode here, offset) etc

suryey configuration data: surveyconfig(national_living_wage) - the inside thing is the thing to look for. constant and othe things like that dont need "functions"

## vdlpgtx configure thing

first row: question, dropdown between response or adjusted response (default to the question we are applying it too, cant change that value). show q100 (primary question), *not* in a box so it doesnt look editable.

second row: comparison question - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

third row: threshold - dropdown between constant and survey configuration data (surveyconfig), default value of 0 in another blank box that is editable

forth row: percentage, literally a box with editable percentage (default 0) (there is a special component for the percentage one, numeric values on design system have a look)

## qvq configure thing

(need to implement, havent done this at all)


first row: question, dropdown between response or adjusted response (default to the question we are applying it too, cant change that value). show q100 (primary question), *not* in a box so it doesnt look editable.

second row: comparison question - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

third row: operator dropdown - all operators in a dropdown. nothing else necessary.

## vrwv

(need to implement, havent done this at all)

first row: question1, dropdown between response or adjusted response (default to the question we are applying it too, cant change that value). show q100 (primary question), *not* in a box so it doesnt look editable.

second row: question2 - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

third row: question3 - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

fourth row: question4 - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

## qezcgz

(need to implement, havent done this at all)

first row: question, dropdown between response or adjusted response (default to the question we are applying it too, cant change that value). show q100 (primary question), *not* in a box so it doesnt look editable.

second row: comparison question - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

## vgzaqtc

(need to implement, havent done this at all)

first row: question, dropdown between response or adjusted response (default to the question we are applying it too, cant change that value). show q100 (primary question), *not* in a box so it doesnt look editable.

second row: comparison question - dropdown between response and adjusted response, editable box with qcode (default to the primary question from above), another box with the offset.

third row: operator dropdown (called comparison_operator, can be called something else in the ui) - all operators in a dropdown. nothing else necessary.

fourth row: threshold - just regular numeric, no dropdown necessary, just a box, default 0, no offset