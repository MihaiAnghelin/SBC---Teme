% Students
student(ion).
student(ana).
student(mihai).
student(emilia).
student(alexandru).
student(andrei).

% Teachers
teacher(maria).
teacher(david).
teacher(lisa).
teacher(stefan).
teacher(elena).
teacher(flavius).

% subjects
subject(math).
subject(physics).
subject(history).
subject(english).
subject(art).
subject(romanian).

% Teaches
teaches(maria, math).
teaches(david, physics).
teaches(lisa, history).
teaches(stefan, english).
teaches(elena, art).
teaches(flavius, romanian).

% subject deadlines
deadline(math, ongoing).
deadline(physics, ongoing).
deadline(history, ongoing).
deadline(english, expired).
deadline(art, expired).
deadline(romanian, expired).

% Grades
:- dynamic(grades/2).
grades(_, []).


add_grade(Student, Subject, Grade):-
    (grades(Student, ExistingGrades) ->
        (member((Subject, _), ExistingGrades) ->
            retract(grades(Student, ExistingGrades)),
            select((Subject, _), ExistingGrades, (Subject, Grade), NewGrades),
            assert(grades(Student, NewGrades))
        ;
        	retractall(grades(Student, _)),
            assert(grades(Student, [(Subject, Grade)|ExistingGrades]))
        )
    ;
        assertz(grades(Student, [(Subject, Grade)]))
    ).
    
initialize_grades:-
    add_grade(ion, math, 10),
    add_grade(ion, english, 9),
    add_grade(ana, math, 8),
    add_grade(mihai, english, 7),
    add_grade(emilia, math, 9),
    add_grade(alexandru, english, 10).

get_all_students:-
	findall(X, student(X), Students),
	write(Students).

get_all_teachers:-
    findall(X, (teacher(X)), Teachers),
	write(Teachers).

get_all_teachers_with_subjects:-
    forall((teacher(Teacher), teaches(Teacher, Subject)), format('~w teaches ~w~n', [Teacher, Subject])).

sum_grades([], 0).
sum_grades([(_, Grade) | Rest], Total) :-
    sum_grades(Rest, RestTotal),
    Total is RestTotal + Grade.

sum_grades([], 0).
sum_grades([(_, Grade) | Rest], Total) :-
    sum_grades(Rest, RestTotal),
    Total is RestTotal + Grade.

calculate_average(Student, Average) :-
    grades(Student, Grades),
    length(Grades, NumGrades),
    (NumGrades > 0 ->
        sum_grades(Grades, Sum),
        Average is Sum / NumGrades
    ;
        Average is 0
    ).

student_with_average_above_5(X, Average) :-
    student(X),
    calculate_average(X, Average),
    Average > 5,
    !.

get_students_with_average_above_5:-
    forall((student(X),
    student_with_average_above_5(X, Average),
    Average > 5),
    format('~w: ~w~n', [X, Average])).

ongoing_deadline(Subject) :-
	deadline(Subject, ongoing).

get_subjects_with_deadline_not_expired:-
	findall(Subject, ongoing_deadline(Subject), Subjects),
	write(Subjects).

get_students_in_alphabetical_order:-
	findall(X, student(X), Students),
	sort(Students, SortedStudents),
	write(SortedStudents).

get_grades_with_students:-
      grades(Student, Grades),
      write((Student, Grades)), nl,
      fail.

get_all_subjects:-
	findall(X, subject(X), Subjects),
	write(Subjects).

process_choice(1):-
	write('Enter student name: '), read(Student),
	write('Enter subject: '), read(Subject),
	write('Enter grade: '), read(Grade),
	add_grade(Student, Subject, Grade),
	loop.
process_choice(2):-
    get_all_students, nl,
    loop.
process_choice(3):-
    get_all_teachers, nl,
    loop.
process_choice(4):-
    get_all_teachers_with_subjects, nl,
    loop.
process_choice(5):-
    get_students_with_average_above_5, nl,
    loop.
process_choice(6):-
    get_subjects_with_deadline_not_expired, nl,
    loop.
process_choice(7):-
    get_students_in_alphabetical_order, nl,
    loop.
process_choice(8):-
    get_grades_with_students, nl,
    loop.
process_choice(9):-
	get_all_subjects, nl,
	loop.

process_choice(0).
process_choice(_):-
	loop.


loop:-
	write('1. Add grades'), nl,
	write('2. Get all students'), nl,
    write('3. Get all teaches'), nl,
	write('4. Get all teachers with subjects'), nl,
	write('5. Get students with average above 5'), nl,
	write('6. Get subjects with deadline not expired'), nl,
    write('7. Get students in alphabetical order'), nl,
    write('8. Get grades of all students'), nl,
	write('9. Get all subjects'), nl,
    write('0. Exit'), nl,
    read(Choice),
    process_choice(Choice).



main:-
    initialize_grades,
	loop.