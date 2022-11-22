# Subject

You are *free* (kind of) to choose a project, however:
* You need to run it through me first to ensure it's not too easy / too hard
* You need to implement the same kind of mandatory described in the [Grade Section](#grade)
    * For really custom project, we will refine together the mandatory

If you *really really* do a super custom project, we can see together how to refine the mandatory, meaning: changing the features set.

## No Idea?

For those that don't have an idea or simply want to go with my idea: **Next Generation Shopping**.

The goal of this project is to create the future of online shopping. It doesn't sound exciting? Make it exciting then :)

# Technologies

For the frontend, you can use absolutely whatever you want:
* React
* Vue
* Svelte
* Vanilla JS

However, because this course is about learning Three.js, you are forbidden to use [React Three Fiber](https://github.com/pmndrs/react-three-fiber). I can only advise you to check it out, but not for this project :)

# Information

* Done in group of **2 students**
  * Please let me know the name of the students in the README.md
* Submitted by the 7th of December at **23:42**
* **-1 point** penalty per minute late
* Hosted if possible, so I can try it out easily :)

The grade will be divided into **three** (no pun intended) categories:
* Mandatory Requirements
* Originality
* User Experience

If the website is dynamic, with smooth transition, fancy animations, you will get the best possible grade. Obviously, it must be dynamic but **shouldn't** affect negatively the user experience (e.g: waiting 10s for an animation to finish).

You will need to send a zip. If they are too large, please host them on your school Google Drive or something.

You are free to design the website's layout / visual look the way you want. There are only a few technical requirements that are asked, but the rest is up to **your choice**. Enjoy the project and try to be original!

For assets, you are advised to download free ones on:
* [Sketchfab](https://sketchfab.com/)
* [Sketchfab glTF Samples](https://sketchfab.com/features/gltf)
* [glTF Repository](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0)

Please remember to always thank the author for providing you amazing free assets!

# Default Subject: Ideas

Here I give a couple of ideas you could follow to get the best possible grade. Those screens, if done correctly, could make you go through all the mandatory features.

The images shown in this section are purely here to help you visualize how the website could look like. This doesn't mean you should take this exact
design or layout.

## Home Page

![Example of what an Home page could look like](screenshots/project/page1.jpg)

This page should display a list of products rendered in **3D**. When the user
selects a product, it should move on to the [Viewer Page](viewer-page).

You can either:

* Create a multi-page website, or simply create a single page
* Create a single-page website that's fully animated.
  For instance, when a product is selected, you could hide
  the list and smoothly modify the layout of the page.

The second option is harder, but will give you extra points if done correctly.

Be careful with one thing here. Because you can't create more than a
few `WebGLRenderer` per tab, you will need to:
* Create a hidden canvas and `WebGLRenderer`
* Render each item to the hidden canvas
* Copy the pixels from the hidden canvas to the product canvas using [Context2D.drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)

## Viewer Page

![Example of what the Viewer page could look like](screenshots/project/page2.jpg)
![Example of what the Viewer page could look like](screenshots/project/page3.jpg)

This page is used to display:

* Information about the product (you can put anything you want here)
* The [Edition Panel](#mandatory-edition-panel) used to see how the product would look like
  with different parameters
* Two buttons to be able to cycle through the previous / next product

Cycling through the product should be done entirely in 3D with a smooth
transition between the products.

# Grade

## Originality (4 points)

You will get those points based on how original & friendly the website is, including:
* Design
* Interesting interactions

## User Experience (2 points)

Users have high expectations. If your website is:
* Friendly to use (I don't need 5min to figure out something)
* Fast & Smooth

You will get the best possible grade.

## Navigation (4 points)

* Home should display a scrollable list of product.
  * Data out of the screen shouldn't be loaded
  * Canvas out of the screen shouldn't be rendered
  * Your list must be at least of size 16 (it's not a random number :))
* User must be able to select a product and open it in a larger view
* In the viewer page, users should be able to cycle through products **without**
  going back to the scroll list
  * The transition should be smooth (e.g: fade in/out, slide in/out, etc...)
  * All products **shouldn't** be loaded simulatenously!
* There must be a way to come back to the scrollable list from the viewer page

## Viewer (5 points)

I have purposely left out some mandatory viewer feature here because you should
know by now what kind of features can help make a 3D scene look good or not.

In addition to all the mandatory features listed below, your viewer **must**
look great. We have seen how some features can drastically improve your renders,
please use them to get the best possible outcome.

* After some time with no user inputs, the camera should smoothly rotate around the object to showcase it.
* Add annotations that allows user to get 3D information on mesh
    * You can get an example of things you should do [here](https://modelviewer.dev/examples/annotations/index.html#addHotspots).
    * You can display any text as a placeholder. They do not need to become transparent when rotating around the model.

## Controls (2 points)

In the viewer tab, the user should be able to:

* Navigate around the object using mouse inputs
* Double click to focus a point on the object
  * You will need to figure out where the user clicked, and move the camera closer to focus this point

## Shadows (2 points)

Your scene will need to have some real light shadows coming from a direction light, that:

* Create real-time shadows from directional lights
  * Independent on the scene scale
  * Have the least possible artefacts
  * Aren't **hardcoded** per objects!

> To increase realism, try to make your directional light match the main light coming
> from your environment. You are allowed to hardcode this.

## Post-Processing (1 points)

You need to use properly at least **one** post-process. It's up to you to choose what you want to do.

The goal is to make the final image look good. I recommend you to use:

* `SSAO`
* `Depth Of Field (DOF)`
* Eventually `Screen Space Reflection (SSR)`

You can either pick one, or even combine them to improve the results.
