Object subclass: #AbstractScope	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!AbstractScope methodsFor: 'testing' stamp: 'jws 11/1/2024 11:49'!isBound: aName
	"Answer true if aName has a binding in scope."
	
	self subclassResponsibility! !!AbstractScope methodsFor: 'accessing' stamp: 'jws 11/1/2024 11:48'!bind: aName
to: aValue
	"Associate a name with a value. Names should be unique within a local scope."
	
	self subclassResponsibility! !!AbstractScope methodsFor: 'accessing' stamp: 'jws 11/1/2024 11:47'!bindingFor: aName
	"Answer the value associated with aName."
	
	self subclassResponsibility! !Object subclass: #BTEnvironment	instanceVariableNames: 'variables methods activations isActive origVars'	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 02:01'!activate	isActive := true.	origVars := variables deepCopy.	activations := variables deepCopy.! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 01:55'!deactivate	variables := origVars deepCopy.	activations := Dictionary new.	isActive := false! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/3/2024 22:21'!declare: aName method: aValue	(methods at: aName ifAbsent: [nil]) ifNotNil: [BTMultipleDeclarationError new signal].	methods at: aName put: aValue.	! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 01:59'!declare: aName variable: aValue 	| oldVar | 	oldVar := (isActive ifTrue: [activations] ifFalse: [variables]) at: aName ifAbsent: [nil]. 	(isActive and: [oldVar notNil]) ifTrue: [activations at: aName put: aValue] ifFalse: [ (variables at: aName ifAbsent: [nil]) 		ifNotNil: [BTMultipleDeclarationError new signal]. 	(isActive ifTrue: [activations] ifFalse: [variables]) at: aName put: aValue ].! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/3/2024 22:16'!hasMethod: aName	^(methods at: aName ifAbsent: [nil]) notNil.! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 01:54'!hasVariable: aName	^(isActive ifTrue: [activations at: aName ifAbsent: [nil]] ifFalse: [variables at: aName ifAbsent: [nil]]) notNil.! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 00:50'!initialize	super initialize.	variables := Dictionary new.	methods := Dictionary new.	isActive := false.	origVars := Dictionary new.	activations := Dictionary new.! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/3/2024 22:19'!method: aName	| value |	value := methods at: aName ifAbsent: [BTUndeclaredError new signal].	^value.! !!BTEnvironment methodsFor: 'as yet unclassified' stamp: 'jpl 12/4/2024 01:42'!variable: aName	| value |	value := (isActive ifTrue: [activations] ifFalse: [variables]) at: aName ifAbsent: [BTUndeclaredError 		new signal].	^value! !TestCase subclass: #BTEnvironmentTestCase	instanceVariableNames: 'env'	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!BTEnvironmentTestCase methodsFor: 'running' stamp: 'jws 11/7/2024 11:37'!testActivation

	env declare: 'winkin' variable: 7.
	env activate.
	self assert: (env hasVariable: 'winkin').
	self
		assert: 7
		equals: (env variable: 'winkin').
	env declare: 'winkin' variable: 9.
	self 
		assert: 9
		equals: (env variable: 'winkin').
	env declare: 'blinkin' variable: 13.
	self assert: (env hasVariable: 'blinkin').
	env deactivate.
	self
		assert: 7
		equals: (env variable: 'winkin').
	self deny: (env hasVariable: 'blinkin').
	! !!BTEnvironmentTestCase methodsFor: 'running' stamp: 'jws 11/7/2024 11:30'!testMethodScope

	self
		should: [env method: 'jaws']
		raise: BTUndeclaredError.
	self deny: (env hasMethod: 'jaws').
	env declare: 'jaws' method: 42.
	self assert: (env hasMethod: 'jaws').
	self
		assert: 42
		equals: (env method: 'jaws').
	self
		should: [env declare: 'jaws' method: 23]
		raise: BTMultipleDeclarationError.
	self deny: (env hasVariable: 'jaws').! !!BTEnvironmentTestCase methodsFor: 'running' stamp: 'jws 11/7/2024 11:30'!testVariableScope

	| var badVar |
	self
		should: [env variable: 'jaws']
		raise: BTUndeclaredError.
	self deny: (env hasVariable: 'jaws').
	var := BTVariable boolean.
	env declare: 'jaws' variable: var.
	self assert: (env hasVariable: 'jaws').
	self
		assert: var
		equals: (env variable: 'jaws').
	badVar := BTVariable string.
	self
		should: [env declare: 'jaws' variable: badVar]
		raise: BTMultipleDeclarationError.
	self deny: (env hasMethod: 'jaws').! !!BTEnvironmentTestCase methodsFor: 'initialize-release' stamp: 'jws 11/7/2024 11:15'!setUp

	super setUp.
	env := BTEnvironment new.! !!BTEnvironmentTestCase methodsFor: 'initialize-release' stamp: 'jws 11/7/2024 11:15'!tearDown

	env := nil.
	super tearDown.! !"-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- "!BTEnvironmentTestCase class	instanceVariableNames: 'env'!!BTEnvironmentTestCase class methodsFor: 'initialize-release' stamp: 'jws 11/6/2024 11:46'!setUp

	super setUp.
	env := BTEnvironment new.
	! !AbstractScope subclass: #Scope	instanceVariableNames: 'outerScope bindings'	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!Scope methodsFor: 'setter' stamp: 'jpl 12/3/2024 21:27'!outerScope: anOuterScope	outerScope := anOuterScope.! !!Scope methodsFor: 'testing' stamp: 'jpl 12/3/2024 21:02'!isBound: aName	(bindings at: aName ifAbsent: [nil]) ifNotNil: [^true].	outerScope ifNotNil: [^outerScope isBound: aName].	^false.! !!Scope methodsFor: 'accessing' stamp: 'jpl 12/3/2024 21:04'!bind: aName to: aValue	(bindings at: aName ifAbsent: [nil]) ifNotNil: [ BTMultipleDeclarationError new signal. ].	bindings at: aName put: aValue.! !!Scope methodsFor: 'accessing' stamp: 'jpl 12/3/2024 21:07'!bindingFor: aName	^(bindings at: aName ifAbsent: [outerScope ifNotNil: [^outerScope bindingFor: aName]. 	BTUndeclaredError new signal.]).! !!Scope methodsFor: 'accessing' stamp: 'jpl 11/30/2024 19:58'!initialize	super initialize.	bindings := Dictionary new.	outerScope := nil.! !"-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- "!Scope class	instanceVariableNames: 'anOuterScope'!!Scope class methodsFor: 'as yet unclassified' stamp: 'jpl 11/30/2024 19:54'!newGlobalScope	^super new initialize. ! !!Scope class methodsFor: 'as yet unclassified' stamp: 'jpl 12/3/2024 21:21'!newInside: anOuterScope	 | newInsideScope |    	newInsideScope := self new.    	newInsideScope outerScope: anOuterScope.    	^newInsideScope.! !TestCase subclass: #ScopeTestCase	instanceVariableNames: 'globalScope var1 var2 var3 var4 innerScope'	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!ScopeTestCase methodsFor: 'initialize-release' stamp: 'jpl 12/3/2024 20:39'!setUp

	super setUp.
	globalScope := Scope newGlobalScope.! !!ScopeTestCase methodsFor: 'initialize-release' stamp: 'jws 11/6/2024 11:26'!setupNestedScopes

	var1 := BTVariable integer.
	var2 := BTVariable boolean.
	var3 := BTVariable string.
	var4 := BTVariable integer.
	globalScope bind: 'cows' to: var1.
	globalScope bind: 'pigs' to: var2.
	innerScope := Scope newInside: globalScope.
	innerScope bind: 'cows' to: var3.
	innerScope bind: 'rooster' to: var4! !!ScopeTestCase methodsFor: 'initialize-release' stamp: 'jws 11/6/2024 11:09'!tearDown

	globalScope := nil.
	super tearDown.! !!ScopeTestCase methodsFor: 'running' stamp: 'jws 11/4/2024 11:49'!testBasicOperation

	| whaleVar var |
	whaleVar := BTVariable boolean.
	self deny: (globalScope isBound: 'Jonah').
	globalScope bind: 'Jonah' to: whaleVar.
	self assert: (globalScope isBound: 'Jonah').
	self
		assert: whaleVar
		equals: (globalScope bindingFor: 'Jonah').
	var := BTVariable integer.
	self
		should: [globalScope bind: 'Jonah' to: var]
		raise: BTMultipleDeclarationError.
	self 
		should: [globalScope bindingFor: 'Melchezidek']
		raise: BTUndeclaredError.
	self deny: (globalScope isBound: 'Melchezidek').! !!ScopeTestCase methodsFor: 'running' stamp: 'jws 11/6/2024 11:30'!testNestedScopesBindingFor

	self setupNestedScopes.
	self
		assert: var1
		equals: (globalScope bindingFor: 'cows').
	self
		assert: var2
		equals: (globalScope bindingFor: 'pigs').
	self
		assert: var3
		equals: (innerScope bindingFor: 'cows').
	self
		assert: var4
		equals: (innerScope bindingFor: 'rooster').
	self
		assert: var2
		equals: (innerScope bindingFor: 'pigs').


! !!ScopeTestCase methodsFor: 'running' stamp: 'jws 11/6/2024 11:33'!testNestedScopesExceptions

	| var5 |
	var5 := BTVariable string.
	self setupNestedScopes.
	self
		should: [innerScope bind: 'rooster' to: var5]
		raise: BTMultipleDeclarationError.
	self
		deny: (innerScope isBound: 'Unicorn').
	self
		should: [innerScope bindingFor: 'Unicorn']
		raise: BTUndeclaredError! !!ScopeTestCase methodsFor: 'running' stamp: 'jws 11/6/2024 11:35'!testNestedScopesIsBound

	self setupNestedScopes.
	self assert: (globalScope isBound: 'cows').
	self assert: (globalScope isBound: 'pigs').
	self assert: (innerScope isBound: 'cows').
	self assert: (innerScope isBound: 'rooster').
	self assert: (innerScope isBound: 'pigs').
	! !AbstractScope subclass: #VoidScope	instanceVariableNames: ''	classVariableNames: 'Singleton'	poolDictionaries: ''	category: 'BigTalk-Scopes'!!VoidScope methodsFor: 'testing' stamp: 'jpl 11/26/2024 13:44'!isBound: aName	^false.! !!VoidScope methodsFor: 'accessing' stamp: 'jpl 11/26/2024 13:44'!bind: aName to: aValue	BTError new signal.! !!VoidScope methodsFor: 'accessing' stamp: 'jpl 11/26/2024 13:44'!bindingFor: aName	BTUndeclaredError new signal.! !"-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- "!VoidScope class	instanceVariableNames: ''!!VoidScope class methodsFor: 'as yet unclassified' stamp: 'jpl 11/30/2024 19:49'!default    Singleton ifNil: [ Singleton := self new. ].    ^Singleton.! !TestCase subclass: #VoidScopeTestCase	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Scopes'!!VoidScopeTestCase methodsFor: 'running' stamp: 'jws 11/4/2024 11:18'!testBindTo

	| scope |
	scope := VoidScope default.
	self
		should: [scope bind: 'myVar' to: BTVariable integer]
		raise: BTError! !!VoidScopeTestCase methodsFor: 'running' stamp: 'jws 11/4/2024 11:19'!testBindingFor

	| scope |
	scope := VoidScope default.
	self
		should: [scope bindingFor: 'myVar']
		raise: BTUndeclaredError! !!VoidScopeTestCase methodsFor: 'running' stamp: 'jws 11/4/2024 11:16'!testIsBound

	| void |
	void := VoidScope default.
	self deny: (void isBound: 'myVar').! !!VoidScopeTestCase methodsFor: 'running' stamp: 'jws 11/4/2024 11:15'!testIsSingleton

	| void1 void2 |
	void1 := VoidScope default.
	void2 := VoidScope default.
	self assert: (void1 == void2).! !