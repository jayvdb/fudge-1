
function raises(exception_name, func) {
    var caught = false;
    try {
        func();
    } catch (e) {
        caught = true;
        equals(e.name, exception_name, e);
    }
    if (!caught) {
        throw new AssertionError("expected to catch " + exception_name);
    }
}

function init_test() {
    fudge.registry.clear_all();
}
    
module("Test Fake");

test("can find objects", function() {
    
    init_test();
    
    simple = {iam: function() { return "simple" }};
    dot = {};
    dot.sep = {iam: function() { return "dot.sep" }};
    
    var fake = new fudge.Fake("simple");
    equals(fake._object.iam(), "simple");
    
    var fake = new fudge.Fake("dot.sep");
    equals(fake._object.iam(), "dot.sep");
});

// this test made more sense when Fake used _object = eval(name)
/*
test("cannot send bad JavaScript as name", function() {
    init_test();
    expect(1);
    raises("TypeError", function() {
        var fake = new fudge.Fake("length()"); // TypeError: length is not a function
    });
});
*/

test("can create objects", function() {
    init_test();
    var fake = new fudge.Fake("_non_existant_.someCall");
    ok(_non_existant_, "_non_existant_");
    ok(_non_existant_.someCall, "_non_existant_.someCall");
});

test("expected call not called", function() {
    /*
    @raises(AssertionError)
    def test_nocall(self):
        exp = self.fake.expects('something')
        fudge.stop()
    */
    init_test();
    expect(1);
    var fake = new fudge.Fake("some_obj");
    fake.expects("someCall");
    raises("AssertionError", function() { 
        fudge.stop() 
    });
});

test("call intercepted", function() {
    init_test();
    var fake = new fudge.Fake("bob_loblaw");
    fake.expects("blog");
    bob_loblaw.blog();
    // stop should pass the test...
    fudge.stop();
});

test("returns value", function() {
    init_test();
    var fake = new fudge.Fake("grocery_store");
    fake.expects("check_eggs").returns("eggs are good!");
    equals(grocery_store.check_eggs(), "eggs are good!");
    fudge.stop();
});

test("returns fake", function() {
    init_test();
    expect(1);
    var fake = new fudge.Fake("ice_skates");
    fake.expects("start").returns_fake().expects("not_called");
    ice_skates.start();
    raises("AssertionError", function() { 
        fudge.stop() 
    });
});

module("Test ExpectedCall");

test("ExpectedCall properties", function() {
    init_test();
    var fake = new fudge.Fake("my_auth_mod");
    var ec = new fudge.ExpectedCall(fake, "logout");
    equals(ec.call_name, "logout");
});

test("call is logged", function() {
    init_test();
    var fake = new fudge.Fake("aa_some_obj");
    var ec = new fudge.ExpectedCall(fake, "watchMe");
    aa_some_obj.watchMe();
    equals(ec.was_called, true, "aa_some_obj.watchMe() was not logged")
});

module("Test fudge.registry");

/*
    def setUp(self):
        self.fake = Fake()
        self.reg = fudge.registry
        # in case of error, clear out everything:
        self.reg.clear_all()
*/

test("expected call not called", function() {
    /*
    @raises(AssertionError)
    def test_expected_call_not_called(self):
        self.reg.start()
        self.reg.expect_call(ExpectedCall(self.fake, 'nothing'))
        self.reg.stop()
    */
    init_test();
    expect(1);
    var fake = new fudge.Fake("some_obj");
    fudge.registry.expect_call(new fudge.ExpectedCall(fake, 'nothing'));
    raises("AssertionError", function() { 
        fudge.registry.stop() 
    });
});

test("start resets calls", function() {
    /*     
    def test_start_resets_calls(self):
        exp = ExpectedCall(self.fake, 'callMe')
        self.reg.expect_call(exp)
        exp()
        eq_(exp.was_called, True)
        
        self.reg.start()
        eq_(exp.was_called, False, "call was not reset by start()")
    */
    init_test();
    var fake = new fudge.Fake("yeah");
    var exp = new fudge.ExpectedCall(fake, "sayYeah");
    fudge.registry.expect_call(exp);
    yeah.sayYeah();
    equals(exp.was_called, true, "call was never logged");
    fudge.registry.start();
    equals(exp.was_called, false, "call was not reset by start()");
});

test("stop resets calls", function() {
    /* 
    def test_stop_resets_calls(self):
        exp = ExpectedCall(self.fake, 'callMe')
        self.reg.expect_call(exp)
        exp()
        eq_(exp.was_called, True)
        eq_(len(self.reg.get_expected_calls()), 1)
        
        self.reg.stop()
        eq_(exp.was_called, False, "call was not reset by stop()")
        eq_(len(self.reg.get_expected_calls()), 1, "stop() should not reset expectations")
    */
    init_test();
    var fake = new fudge.Fake("reset_yeah");
    var exp = new fudge.ExpectedCall(fake, "sayYeah");
    fudge.registry.expect_call(exp);
    equals(fudge.registry.expected_calls.length, 1, "registry has too many calls");
    reset_yeah.sayYeah();
    equals(exp.was_called, true, "call was never logged");
    
    fudge.registry.stop();
    equals(exp.was_called, false, "call was not reset by stop()");
    equals(fudge.registry.expected_calls.length, 1, "stop() should not reset expectations");
});

test("global stop", function() {
    /*
    def test_global_stop(self):
        exp = ExpectedCall(self.fake, 'callMe')
        exp()
        self.reg.expect_call(exp)
        eq_(exp.was_called, True)
        eq_(len(self.reg.get_expected_calls()), 1)
        
        fudge.stop()
        
        eq_(exp.was_called, False, "call was not reset by stop()")
        eq_(len(self.reg.get_expected_calls()), 1, "stop() should not reset expectations")
    */
    init_test();
    var fake = new fudge.Fake("gstop_yeah");
    var exp = new fudge.ExpectedCall(fake, "sayYeah");
    gstop_yeah.sayYeah();
    fudge.registry.expect_call(exp);
    equals(exp.was_called, true, "call was never logged");
    equals(fudge.registry.expected_calls.length, 1, "registry has wrong number of calls");
    
    fudge.stop();
    
    equals(exp.was_called, false, "call was not reset by stop()");
    equals(fudge.registry.expected_calls.length, 1, "stop() should not reset expectations");
});

test("global clear expectations", function() {  
    /* 
    def test_global_clear_expectations(self):
        exp = ExpectedCall(self.fake, 'callMe')
        exp()
        self.reg.expect_call(exp)
        eq_(len(self.reg.get_expected_calls()), 1)
        
        fudge.clear_expectations()
        
        eq_(len(self.reg.get_expected_calls()), 0, 
            "clear_expectations() should reset expectations")
    */
    init_test();
    var fake = new fudge.Fake("gclear_yeah");
    var exp = new fudge.ExpectedCall(fake, "sayYeah");
    gclear_yeah.sayYeah();
    fudge.registry.expect_call(exp);
    equals(fudge.registry.expected_calls.length, 1, "registry has wrong number of calls");
    
    fudge.clear_expectations();
    
    equals(fudge.registry.expected_calls.length, 0, "clear_expectations() should reset expectations");
});

