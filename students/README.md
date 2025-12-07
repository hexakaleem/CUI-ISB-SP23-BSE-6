Students routes must be here
//by Mahad Kamran (SP23-BSE-023)
router.get('/:studentId', async (req, res) => {
    res.set('Cache-Control', 'no-store'); 
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid Student ID format' });
        }

        const studentPromise = User.findById(studentId).select('-password');

        const classesPromise = Class.find({ students: studentId })
                                    .populate('teacher', 'name email')
                                    .select('classname teacher createdAt');

        const marksPromise = Marks.find({ studentId: studentId })
                                  .populate('subjectId', 'classname');

        const [student, classes, marks] = await Promise.all([
            studentPromise,
            classesPromise,
            marksPromise
        ]);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const classIds = classes.map(c => c._id);
        
        const assignments = await Assignment.find({ 
            classId: { $in: classIds } 
        }).sort({ createdAt: -1 });

        const processedAssignments = assignments.map(assign => {
            const submission = assign.submissions.find(sub => sub.studentId.toString() === studentId);
            return {
                _id: assign._id,
                title: assign.title,
                classId: assign.classId,
                status: submission ? 'Submitted' : 'Pending',
                marksObtained: submission ? submission.marks : null,
                dueDate: assign.createdAt
            };
        });

        const dashboardData = {
            profile: {
                name: student.name,
                email: student.email,
                role: student.role,
                joined: student.createdAt
            },
            stats: {
                classesEnrolled: classes.length,
                assignmentsPending: processedAssignments.filter(a => a.status === 'Pending').length,
                averageMarks: marks.length > 0 
                    ? (marks.reduce((acc, curr) => acc + curr.marks, 0) / marks.length).toFixed(1) 
                    : 0
            },
            classes: classes,
            results: marks,
            assignments: processedAssignments
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
