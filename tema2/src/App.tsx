import './App.css'
import {Button, Divider, Select, Typography, Upload, UploadFile, UploadProps} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {useState} from "react";
import {convertXML} from 'simple-xml-to-json';
import {Line} from "./Line.tsx";

const {Text} = Typography;

function App() {
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [json, setJson] = useState<any>({});
    const [selectedStudent, setSelectedStudent] = useState("")
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("")

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);

            setSelectedStudent("");
            setSelectedTeacher("");
            setSelectedSubject("");
            setJson({});
        },
        beforeUpload: (file) => {
            setFileList([file]);

            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target?.result;

                const myJson = convertXML(content as string);
                console.log(myJson)

                setSelectedStudent("");
                setSelectedTeacher("");
                setSelectedSubject("");
                setJson(myJson);
            };

            reader.readAsText(file);

            return false;
        },
        fileList,
    };

    const getTeacherSubject = (teacher: string) => {
        if (!teacher) return "";

        const subject = json?.school?.children[3].teaches.children.find((obj: any) => {
            return obj.teach.children[0].teacher.content === teacher;
        }).teach.children[1].subject.content;

        return subject;
    }

    const getTeacherBySubject = (subject: string) => {
        if (!subject) return "";

        const teacher = json?.school?.children[3].teaches.children.find((obj: any) => {
            return obj.teach.children[1].subject.content === subject;
        }).teach.children[0].teacher.content;

        return teacher;
    }

    const getSubjectDeadline = (subject: string) => {
        if (!subject) return "";

        const deadline = json?.school?.children[4].deadlines.children.find((obj: any) => {
            return obj.deadline.children[0].subject.content === subject;
        }).deadline.children[1].status.content;

        return deadline;
    }

    type Grade = {
        subject: string;
        grade: string;
    }
    const getGrades = (student: string): Grade[] => {
        if (!student) return [];

        const gradesByStudent = json?.school?.children[5].all_grades.children.find((obj: any) => {
            const name = Object.keys(obj)[0];
            return name === student;
        })[student].children;

        const gradesAndSubjects = gradesByStudent.map((child: any) => {
            const subject = child.grades.children[0].subject.content;
            const grade = child.grades.children[1].grade.content;
            return {subject, grade};
        });

        return gradesAndSubjects;
    }

    const getStudentAverage = (student: string) => {
        if (!student) return 0;

        const grades = getGrades(student);

        const average = grades.reduce((acc, curr) => {
                return acc + parseInt(curr.grade);
            }
            , 0) / grades.length;

        return average;
    }

    const getStudentStatusByRule = (student: string) => {
        if (!student) return "";

        const average = getStudentAverage(student);

        const rules = json?.school?.children[6].rules.children;

        for (const rule of rules) {
            const cond = rule.rule.children[0];
            const status = rule.rule.children[1].then.children[1].status.content;


            const st = Object.keys(cond.if.children[0])[0];
            const av = Object.keys(cond.if.children[1])[0];
            const op = Object.keys(cond.if.children[2])[0];
            const value = cond.if.children[2][op].content;
            console.log(st, av, op, value, average)

            if (st === "student" && av === "average" && op === "greater" && average > value) {
                return status;
            }
            if (st === "student" && av === "average" && op === "above" && average > value) {
                return status;
            } else if (st === "student" && av === "average" && op === "above" && average <= value) {
                return rule.rule.children[2].else.children[1].status.content;
            }
        }
        return "";
    }

    return (
        <div className={"grid grid-cols-layout justify-items-center mt-20"}>
            <div className={"flex flex-col gap-2"}>

                <Upload
                    {...props}
                >
                    <Button icon={<UploadOutlined/>}>Click to Upload</Button>
                </Upload>

                <Line>
                    <Text>Students:</Text>
                    <Select
                        value={selectedStudent}
                        onChange={(value) => {
                            setSelectedStudent(value);
                        }}
                        style={{minWidth: 150}}
                        options={json?.school?.children[0].students.children.map((obj: any) => {
                            const name = obj.student.content;
                            return {
                                value: name,
                                label: name,
                            }
                        })}
                    />
                    {selectedStudent &&
                        <Text>Status: {getStudentStatusByRule(selectedStudent)}</Text>
                    }
                </Line>

                <Line>
                    <Text>Teachers:</Text>
                    <Select
                        value={selectedTeacher}
                        onChange={(value) => {
                            setSelectedTeacher(value);
                        }}
                        style={{minWidth: 150}}
                        options={json?.school?.children[1].teachers?.children.map((obj: any) => {
                            const name = obj.teacher.content;
                            return {
                                value: name,
                                label: name,
                            }
                        })}
                    />

                    {selectedTeacher &&
                        <Text>Teaches: {getTeacherSubject(selectedTeacher)}</Text>
                    }
                </Line>

                <Line>
                    <Text>Subjects:</Text>
                    <Select
                        value={selectedSubject}
                        onChange={(value) => {
                            setSelectedSubject(value);
                        }}
                        style={{minWidth: 150}}
                        options={json?.school?.children[2].subjects?.children.map((obj: any) => {
                            const name = obj.subject.content;
                            return {
                                value: name,
                                label: name,
                            }
                        })}
                    />

                    {selectedSubject && <>
                        <Text><span className={"font-bold"}>Teacher</span>: {getTeacherBySubject(selectedSubject)}
                        </Text>

                        <Divider type={"vertical"}/>

                        <Text><span
                            className={"font-bold"}>Deadline Status</span>: {getSubjectDeadline(selectedSubject)}
                        </Text>
                    </>}
                </Line>


            </div>
            <div>
                {selectedStudent &&
                    <div className={"flex flex-col"}>
                        <Text>Grades of {selectedStudent}: </Text>
                        {getGrades(selectedStudent).map(item =>
                            <Text key={item.subject}>
                                {item.subject}: {item.grade}
                            </Text>
                        )}

                        <Divider/>

                        <Text>Average: {getStudentAverage(selectedStudent)}</Text>
                    </div>
                }

            </div>
        </div>
    )
}

export default App
