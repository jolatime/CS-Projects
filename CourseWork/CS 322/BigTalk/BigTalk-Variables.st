Object subclass: #BTVariable	instanceVariableNames: 'type value'	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Variables'!!BTVariable methodsFor: 'accessing' stamp: 'jws 10/31/2024 11:29'!get
	
	^value! !!BTVariable methodsFor: 'accessing' stamp: 'jws 11/1/2024 11:23'!set: aValue

	self type checkType: aValue.
	value := aValue! !!BTVariable methodsFor: 'accessing' stamp: 'jws 10/31/2024 11:28'!type
	
	^type! !!BTVariable methodsFor: 'accessing' stamp: 'jws 10/31/2024 11:27'!type: aBTType 

	type := aBTType! !"-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- "!BTVariable class	instanceVariableNames: ''!!BTVariable class methodsFor: 'instance creation' stamp: 'jws 11/1/2024 11:20'!boolean
	
	^self type: BTType boolean.
! !!BTVariable class methodsFor: 'instance creation' stamp: 'jpl 11/18/2024 10:32'!integer
	
	^self type: BTType integer.
! !!BTVariable class methodsFor: 'instance creation' stamp: 'jpl 11/18/2024 10:32'!string
	
	^self type: BTType string.
! !!BTVariable class methodsFor: 'instance creation' stamp: 'jws 10/31/2024 11:19'!type: aBTType 

	| aBTVariable |
	aBTVariable := self new.
	aBTVariable type: aBTType.
	^aBTVariable! !TestCase subclass: #BTVariableTestCase	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Variables'!!BTVariableTestCase methodsFor: 'running' stamp: 'jws 10/31/2024 11:50'!testBooleanVariable

	| var |
	var := BTVariable boolean.
	self 
		assert: BTBooleanType default 
		equals: var type.
	self assert: nil equals: var get.
	var set: false.
	self assert: false equals: var get.
	self 
		should: [var set: 9]
		raise: BTTypeError.
	self assert: false equals: var get.
	self 
		should: [var set: 'hello']
		raise: BTTypeError.
	self assert: false equals: var get.
		! !!BTVariableTestCase methodsFor: 'running' stamp: 'jws 10/30/2024 11:42'!testGenericConstructor

	| var |
	var := BTVariable type: BTIntegerType default.
	self assert: BTIntegerType default equals: var type.
	self assert: var get isNil.
	var set: 13.
	self assert: 13 equals: var get.! !!BTVariableTestCase methodsFor: 'running' stamp: 'jws 10/31/2024 11:50'!testIntegerVariable

	| var |
	var := BTVariable integer.
	self 
		assert: BTIntegerType default 
		equals: var type.
	self assert: nil equals: var get.
	var set: 42.
	self assert: 42 equals: var get.
	self 
		should: [var set: true]
		raise: BTTypeError.
	self assert: 42 equals: var get.
	self 
		should: [var set: 'hello']
		raise: BTTypeError.
	self assert: 42 equals: var get.
		! !!BTVariableTestCase methodsFor: 'running' stamp: 'jws 10/31/2024 11:51'!testStringVariable

	| var |
	var := BTVariable string.
	self 
		assert: BTStringType default 
		equals: var type.
	self assert: nil equals: var get.
	var set: 'hello'.
	self assert: 'hello' equals: var get.
	self 
		should: [var set: 9]
		raise: BTTypeError.
	self assert: 'hello' equals: var get.
	self 
		should: [var set: true]
		raise: BTTypeError.
	self assert: 'hello' equals: var get.
		! !