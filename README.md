# RateMyTJ

### Andrew Lam

Project for Mobile and Web App Senior Research Lab            
Visit it at https://rate-my-tj.sites.tjhsst.edu/

## What is RateMyTJ?

RateMyTJ is a web application that serves as a course catalog to help TJHSST students select their courses. Students may view statistics such as workload and difficulty of each class and input their own reviews of each class.

## Inspiration

The [current TJHSST course catalog](https://insys.fcps.edu/CourseCatOnline/frontPanel/503/nocourselist/0/0/0/1) is well... not the best. As I was scrolling through the catalog last year to find the right class to fit into my schedule, I ran into many difficulties and wish the catalog was more helpful, and many of my classmates feel the same way. There are many issues in the current catalog, including vague class descriptions[^1], uncommon course names[^2], and incorrect requisites[^3]. Additionally, there are many features missing from the catalog, such as student feedback, class score, and workload. This project is inspired by college Faculty Course Evaluations, which according to many studies, help "continue the development of excellence" in education for both students and faculty[^4].

## Technologies Used

For the backend, I used [ExpressJS](https://expressjs.com/) and [MySQL](https://www.mysql.com/) to host the website and database.         
For the frontend, I used [handlebars](https://handlebarsjs.com/) and used [Tailwind CSS](https://tailwindcss.com/) for the style of the website. The icons found on the site are from [Font Awesome](https://fontawesome.com/license).                
I utilized the [noUISlider](https://refreshless.com/nouislider/) library for the slider filter and the [DataTablesJS](https://datatables.net/) library for the tables found on the website.              
For account authentication, I used [OAuth 2.0](https://oauth.net/2/) and [TJHSST Ion](https://tjcsl.github.io/ion/) and hosted the website on [TJHSST Director](https://documentation.tjhsst.edu/services/director).     

## How it Works

Information displayed on the main page are retrieved from the ```classes``` table, and users can use the filters found on the main page to filter for the class that they want. These filters use the ```dataTable.ext.search.push``` method from DataTablesJS, and the slider is powered by noUISlider. Users can click on a class name to view more specific details about the course (such as [here](https://rate-my-tj.sites.tjhsst.edu/class/3199R1)), including teacher breakdowns and year-by-year data, which is retreived from their corresponding ```class_classID``` table. Written reviews from other users about the class will also be displayed on the page, and logged in users can like, dislike, and add funny votes to the written reviews, and this information is stored in the ```class_classID_feedback``` table and in the corresponding review in the ```class_classID``` table. Bad reviews may also be reported, and these reports are stored in the ```reports``` table.

Users may also input their own feedback by first logging in through Ion and then visiting their [profile page](https://rate-my-tj.sites.tjhsst.edu/profile). When a user first visits their [profile page](https://rate-my-tj.sites.tjhsst.edu/profile), a table naamed ```user_feedback_userID``` is created, and all of their inputted class feedback will be stored there. On the profile page, users may add, edit, and delete feedback. Every time they do so, In addition, their class feedback will be also stored in the corresponding ```class_classID``` table and will update the main ```classes``` table.

Please report any suggestions and bugs by creating a [new issue](https://github.com/superandybean/RateMyTJ/issues/new) and use the correct label. Use the ```bug``` label to report bugs, the ```enhancement``` label for new features and suggestions, and the ```fix class information```  label for incorrect, vague, or missing class information (such as its description).

## Possible Improvements

- [ ] Mobile Support
- [ ] Improve Website Design
- [ ] Four Year Planner
- [ ] Other Features lol

## Papers and Video

All papers and videos can be found in this folder [here](https://github.com/superandybean/RateMyTJ/tree/master/papers). Final paper and video coming soon valvetimeTM.

## Screenshots

Also coming soon valvetimeTM.

[^1]: [Specialized Computer Assisted Design](https://insys.fcps.edu/CourseCatOnline/sharecourse/503/10433/0/0/0/1) talked more about parametric CAD programs than the class itself.
[^2]: Quantum Mechanics is listed as [Electrodynamics](https://insys.fcps.edu/CourseCatOnline/sharecourse/503/9502/0/0/0/1) in the course catalog, leaving students confused when they're trying to find the class.
[^3]: [TJ Math 4](https://insys.fcps.edu/CourseCatOnline/sharecourse/503/11344/0/0/0/1) takes either TJ Math 3 or Algebra 2 credit as a prerequisite, however none of these are listed here.
[^4]: Vickery, Connie E. "Formative Course Evaluation: A Positive Student and Faculty Experience." Journal of the American Dietetic Association, vol. 89, no. 2, Feb. 1989, pp. 259-60. ScienceDirect, https://doi.org/10.1016/S0002-8223(21)02108-8.
