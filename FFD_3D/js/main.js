//FFD using three.js
//Author: Jans Margevics 2012
//TODO 
$(function() {
	var plane;
	var camera, controls, scene, projector;
	var currentMesh;
	var clientWidth, clientHeight;
	var cpNum = 2;
	var controlPoints = [];
	var selectedCp;
	var draggable = [];
	var verts0 = [];
	var loaded = false;
	var meshName = "obj/avahead.obj";
	var object;
    var parse = false;
	var loader;
    var geometry;
    var material;
    var modelObj;
    var scale = 1.0;
	for (i = 0; i <= cpNum; ++i) {
		controlPoints[i] = new Array ();
		for (var j = 0; j <= cpNum; j++) {
			controlPoints[i][j] = new Array();
		}
	}

	var origin = new THREE.Vector3(0,0,0);
	var axis = new THREE.Vector3(0,0,0);
	var sAxis = new THREE.Vector3(0,0,0);
	var tAxis = new THREE.Vector3(0,0,0);
	var uAxis = new THREE.Vector3(0,0,0);
	var lattice;

	initControls();

	//We fill array with empty vectors
	for(var i = 0; i <= cpNum * cpNum * cpNum; i++){
		controlPoints[i] = new THREE.Vector3(0,0,0);
	}

	var renderer = new THREE.WebGLRenderer({antialias: true});
	projector = new THREE.Projector();

	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	
	var loader = new THREE.OBJLoader();

	clientWidth = $('#context').width();
	clientHeight = $('#context').height();

	var mouse = new THREE.Vector2(),
	offset = new THREE.Vector3(),
	INTERSECTED, SELECTED;

	init();
	animate();

	function initControls() {

        var fileInput = document.getElementById('file');

        fileInput.addEventListener('change', function(e) {
            var reader = new FileReader(); //create reader

            reader.onload = function() { //attach onload
                //do something with the result
                // console.log("HERE bla");
                // console.log(reader.result);
                // localStorage.object = reader.result; //saved to localStorage
                console.log("HERE 1");
                parse = true;
                // console.log(parse);
                modelObj = reader.result;
                // console.log(modelObj);
                resetMesh();
                // createImg(localStorage.img); //retrieved from localStorage
            };

            console.log("HERE 2");
            modelObj = e.target.files[0];
            reader.readAsText(modelObj); //trigger onload function
            console.log("HERE 3");
        });

		$(".button").button();

        $("#obj-select").change(function() {
            var value = $('#obj-select').val();
            meshName = 'obj/' + value + '.obj';
            parse = false;
            resetMesh();
        });

        $("#reset").click( function (event){
            resetMesh();
        });

		$("#saveObj").click( function (event){
           console.log("save");
            var exporter = new THREE.saveGeometryToObj(currentMesh.geometry);
		});

		$( "#cpSlider" ).slider({
	            value:3,
	            min: 2,
	            max: 4,
	            step: 1,
	            slide: function( event, ui ) {
	                $("#amount").val( ui.value );
	                cpNum = Number(ui.value - 1);
	                resetMesh();
	            }
        });

	    $("#amount").val($("#cpSlider").slider("value"));
	}


	function init() {
		renderer.setSize(clientWidth, clientHeight );
		$('#context').append(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 60, clientWidth/clientHeight, 0.1, 1000 );
		camera.position.z = 190;

		controls = new THREE.TrackballControls( camera, $('#context')[0] );
		scene = new THREE.Scene();

		plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ),
            new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
		plane.visible = true;
		scene.add( plane );

		geometry = new THREE.CylinderGeometry( 0, 40, 130, 10, 10 );
		material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
		geometry.computeBoundingBox();
		loader = new THREE.OBJLoader();

		loader.addEventListener( 'load', function ( event ) {
			object = event.content;
            loadingModel(object);
		});

        if (!parse){
            console.log("load");
            loader.load( meshName );
        } else{
            console.log("parse");
            loadingModel(loader.parse( modelObj ));
        }

        console.log(loader);

		light1 = new THREE.DirectionalLight( 0xffffff );
		light1.position.set( 1, 1, 1 );
		scene.add( light1 );

		light2 = new THREE.DirectionalLight( 0x002288 );
		light2.position.set( -1, -1, -1 );
		scene.add( light2 );

		light3 = new THREE.AmbientLight( 0x222222 );
		scene.add( light3 );
	}

	function loadingModel(object){

        for ( var i = 0, l = object.children.length; i < l; i ++ )
            object.children[ i ].material = material;

        object.position.y = 0;
        object.position.z = 0;
        currentMesh = object.children[0];
        currentMesh.geometry.computeBoundingBox();
        console.log(currentMesh);
        findScaleToObject();

        scene.add( object );
        initCPoints();
        generateLattice();

        //Storing initial array of vertices
        for ( var i = 0; i < object.children[0].geometry.vertices.length; i ++ )
            verts0.push(object.children[0].geometry.vertices[i]);

        loaded = true;
    }

	function findScaleToObject(){
        var pmax = 0;
        var pmin = 0;
        for (var i = 0; i < currentMesh.geometry.vertices.length; i++){
            pmax = Math.max(pmax, currentMesh.geometry.vertices[i].x);
            pmin = Math.min(pmin, currentMesh.geometry.vertices[i].x);
        }
        console.log("max " + pmax + "min " + pmin);

        var diff = pmax;

        if (diff < 0.5 ){
            scale = 0.01;
            camera.fov = 0.1;
        }
        else if (diff <= 5){
            scale = 0.08;
            camera.fov = 10;
        } else if (diff <= 10){
            scale = 0.2;
            camera.fov = 60;
        } else if (diff <= 40){
            scale = 1.5;
            camera.fov = 60;
        } else{
            scale = 3.0;
            camera.fov = 80;
        }

        camera.zoom = 0;
        camera.updateProjectionMatrix();

        console.log("scale = " + scale);


    }

    function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function resetMesh() {
		for (var i = scene.children.length - 1; i >= 0 ; i -- ) {
		   var obj = scene.children[ i ];
		    if ( obj !== light1 && obj !== light2 && obj !== light3 && obj !== plane) {
		        scene.remove(obj);
		    }
		}

		for(var i = 0; i <= cpNum * cpNum * cpNum; i++){
			controlPoints[i] = new THREE.Vector3(0,0,0);
		}

		origin = new THREE.Vector3(0,0,0);
		axis = new THREE.Vector3(0,0,0);
		sAxis = new THREE.Vector3(0,0,0);
		tAxis = new THREE.Vector3(0,0,0);
		uAxis = new THREE.Vector3(0,0,0);

		verts0 = [];
		draggable = [];
		selectedCp = null;

        if (!parse){
            loader.load( meshName );
        } else{
            console.log("parse");
            loadingModel(loader.parse( modelObj ));
            console.log("parse2");
        }
	}

	function render() {
		controls.update();
		renderer.render( scene, camera );
	}

	function factorial(n) {
		var fact = 1;
		for (var i = n; i > 0; i--)
			fact *= i;
		return fact;
	}

	//bernstein polynomial of v-th degree.
	function bernstein(u,v,stuPt) {
		var binomial, bern;
		binomial = factorial(v) / ( factorial(v - u) * factorial(u) );
		bern = binomial * Math.pow(stuPt, u) * Math.pow((1 - stuPt), (v-u));
		return bern;
	}

	function generateLattice(){
		//Getting vertices data
		var geometry = new THREE.Geometry();
		for ( var cp = 0; cp < draggable.length; cp++ ){
			geometry.vertices.push( draggable[cp].position );
		}
		//Generating indices data
		for ( var i = 0; i <= cpNum; i++ ){				
			for ( var j = 0; j <= cpNum; j++ ){
				for ( var k = 0; k <= cpNum; k++ ){
					if ( (j < cpNum) && (k < cpNum) )
						geometry.faces.push( new THREE.Face4( k + (j*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)), k + ((j+1)*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)), (k+1) + ((j+1)*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)),  (k+1) + (j*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)) ) );
					if ( (i < cpNum) && (k < cpNum) )
						geometry.faces.push( new THREE.Face4( k + (j*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)), k + (j*(cpNum+1)) + ((i+1)*(cpNum+1)*(cpNum+1)), (k+1) + (j*(cpNum+1)) + ((i+1)*(cpNum+1)*(cpNum+1)), (k+1) + (j*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)) ) );	
					if ( (i < cpNum) && (j < cpNum) )
						geometry.faces.push( new THREE.Face4(k + (j*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)), k + ((j+1)*(cpNum+1)) + (i*(cpNum+1)*(cpNum+1)), k + ((j+1)*(cpNum+1)) + ((i+1)*(cpNum+1)*(cpNum+1)), k + (j*(cpNum+1)) + ((i+1)*(cpNum+1)*(cpNum+1)) ) );
				}
			}
		}
		lattice = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ) );
		lattice.geometry.verticesNeedUpdate = true;
		scene.add( lattice );
	}

	function initCPoints() {
		//getting the axis origin
		origin = currentMesh.geometry.boundingBox.min;
		axis.sub(currentMesh.geometry.boundingBox.max, currentMesh.geometry.boundingBox.min);

		sAxis.setX(axis.x);
		tAxis.setY(axis.y);
		uAxis.setZ(axis.z);		

		var cubeG = new THREE.CubeGeometry(1,1,1); 
		var material2 = new THREE.MeshBasicMaterial({color: 0x000000});

		//Positioning vertices along the stu axis. pos = (origin + (ijk) / control points number) * axis vector
		var cp = 0;
		for(var i = 0; i <= cpNum; ++i){
		 	cp++;
	    	for(var j = 0; j <= cpNum; ++j){
	      		for (var k = 0; k <= cpNum; ++k){
					controlPoints[cp].setX( origin.x + ((i/cpNum) * axis.x) );
					controlPoints[cp].setY( origin.y + ((j/cpNum) * axis.y) );
					controlPoints[cp].setZ( origin.z + ((k/cpNum) * axis.z) );
					
					var cube = new THREE.Mesh(cubeG, material2);
					cube.position.x = controlPoints[cp].x;
					cube.position.y = controlPoints[cp].y;
					cube.position.z = controlPoints[cp].z;
                    cube.scale.x = scale;
                    cube.scale.y = scale;
                    cube.scale.z = scale;

                    cube.updateMatrix();
                    draggable.push(cube);
                    scene.add(cube);
	      		}
	    	}
		}
	}

	// Applying bernstein polynomial to every vertex.
	function deform(vec) {
		var STUp = convertToSTU(vec);
		var ffd1 = new THREE.Vector3(0,0,0);
		var ffd2 = new THREE.Vector3(0,0,0);
		var ffd3 = new THREE.Vector3(0,0,0);
		var bpS = 0;
		var bpT = 0;
		var bpU = 0;

		var currentCp = 0;

		for(var i = 0; i <= cpNum; i++) {
		    ffd2.setX(0); ffd2.setY(0); ffd2.setZ(0); 
		    for(var j = 0; j <= cpNum; j++) {
		      ffd3.setX(0); ffd3.setY(0); ffd3.setZ(0);
		      for(var k = 0; k <= cpNum; k++) {
		      	bpU = bernstein(k, cpNum, STUp.z);
		      	ffd3.x = ffd3.x + (bpU * lattice.geometry.vertices[currentCp].x);
		      	ffd3.y = ffd3.y + (bpU * lattice.geometry.vertices[currentCp].y);
		      	ffd3.z = ffd3.z + (bpU * lattice.geometry.vertices[currentCp].z);
		      	currentCp++;
		      }
		      bpT = bernstein(j, cpNum, STUp.y); 
		      ffd2.x = ffd2.x + (bpT * ffd3.x);
		      ffd2.y = ffd2.y + (bpT * ffd3.y);
		      ffd2.z = ffd2.z + (bpT * ffd3.z);
		    }
		    bpS = bernstein(i, cpNum, STUp.x);
		    ffd1.x = ffd1.x + (bpS * ffd2.x);
		    ffd1.y = ffd1.y + (bpS * ffd2.y);
		    ffd1.z = ffd1.z + (bpS * ffd2.z);    
		}
		return ffd1;
	}

	//Deform inital vertices and sets them to the current mesh
	function deformMesh(){
		for (var i = 0; i < currentMesh.geometry.vertices.length; i++){
			currentMesh.geometry.vertices[i] = deform(verts0[i]);
		}
		currentMesh.geometry.verticesNeedUpdate = true;
	}

	function convertToSTU(vec) {
		//calculate S T U values of reparametrized position
		var stuVec = new THREE.Vector3(0,0,0);
		var cpS = new THREE.Vector3(0,0,0);
		var cpT = new THREE.Vector3(0,0,0);
		var cpU = new THREE.Vector3(0,0,0);
		var vs = new THREE.Vector3(0,0,0);

		cpS.cross(tAxis, uAxis);
		cpT.cross(sAxis, uAxis);
		cpU.cross(sAxis, tAxis);
		vs.sub(vec, origin);
		
		dot1 = new THREE.Vector3();
		dot2 = new THREE.Vector3();

		stuVec.setX( cpS.dot(vs) / cpS.dot(sAxis) );   
		stuVec.setY( cpT.dot(vs) / cpT.dot(tAxis) );
		stuVec.setZ( cpU.dot(vs) / cpU.dot(uAxis) );
  		return stuVec;  
	}

	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( (event.clientX - $('#context')[0].offsetLeft) / $('#context')[0].offsetWidth  ) * 2 - 1;
		mouse.y = -( (event.clientY - $('#context')[0].offsetTop) / $('#context')[0].offsetHeight  ) * 2 + 1;
		
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		if ( SELECTED ) {
			var intersects = ray.intersectObject( plane );
			SELECTED.position.copy( intersects[ 0 ].point.subSelf( offset ) );
			lattice.geometry.vertices[selectedCp].copy( draggable[selectedCp].position );
			lattice.geometry.verticesNeedUpdate = true;
			deformMesh();
			return;
		}
		
		var intersects = ray.intersectObjects( draggable );

		if ( intersects.length > 0 ) {
			if ( INTERSECTED != intersects[ 0 ].object ) {
				for (var cc = 0; cc < draggable.length; cc++)
				{
					if (draggable[cc] == intersects[ 0 ].object) {
						selectedCp = cc;
					}
				}
				
				INTERSECTED = intersects[ 0 ].object;
				plane.position.copy( INTERSECTED.position );
				plane.lookAt( camera.position );
			}
			$('#context').css('cursor','pointer');

		} else {

			INTERSECTED = null;
			$('#context').css('cursor','auto');
		}
	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		mouse.x = ( (event.clientX - $('#context')[0].offsetLeft) / $('#context')[0].offsetWidth  ) * 2 - 1;
		mouse.y = -( (event.clientY - $('#context')[0].offsetTop) / $('#context')[0].offsetHeight  ) * 2 + 1;
		
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		
		var intersects = ray.intersectObjects( draggable );
		if ( intersects.length > 0 ) {

			controls.enabled = false;
			SELECTED = intersects[ 0 ].object;
			var intersects = ray.intersectObject( plane );
			offset.copy( intersects[ 0 ].point ).subSelf( plane.position );
			$('#context').css('cursor','move');
		}
	}

	function onDocumentMouseUp( event ) {
		event.preventDefault();
		controls.enabled = true;
		
		if ( INTERSECTED ) {
			
			plane.position.copy( INTERSECTED.position );
			lattice.geometry.verticesNeedUpdate = true;
			lattice.geometry.vertices[selectedCp].copy( draggable[selectedCp].position );
			deformMesh();
			SELECTED = null;
		}
		$('#context').css('cursor','auto');
	}

    THREE.saveGeometryToObj = function (geometry) {
        var s = '';
        for (i = 0; i < geometry.vertices.length; i++) {
            s+= 'v '+(geometry.vertices[i].x) + ' ' +
                geometry.vertices[i].y + ' '+
                geometry.vertices[i].z + '\n';
        }

        for (i = 0; i < geometry.faces.length; i++) {

            s+= 'f '+ (geometry.faces[i].a+1) + ' ' +
                (geometry.faces[i].b+1) + ' '+
                (geometry.faces[i].c+1);

            if (geometry.faces[i].d !== undefined) {
                s+= ' '+ (geometry.faces[i].d+1);
            }
            s+= '\n';
        }

        console.log(s);
        return s;
    }
});